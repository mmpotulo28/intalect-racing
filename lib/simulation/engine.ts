import {
  FUEL_CONSUMPTION,
  GRAVITY_MPS2,
  ROUNDING,
  TYRE_DEGRADATION_COEFFICIENTS,
} from "@/lib/constants/race";
import type {
  LevelConfig,
  SimulationResult,
  SimulationScoreBreakdown,
  StrategyLapAction,
  StrategyPlan,
  StrategySegmentAction,
  TyreProperty,
  WeatherCondition,
  WeatherEntry,
} from "@/lib/types/racing";

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const safeDiv = (numerator: number, denominator: number): number => {
  if (Math.abs(denominator) < ROUNDING.EPSILON) {
    return 0;
  }

  return numerator / denominator;
};

const round = (value: number): number => {
  const factor = 10 ** ROUNDING.DECIMALS;
  return Math.round(value * factor) / factor;
};

const findWeatherAtTime = (level: LevelConfig, elapsedTimeS: number): WeatherEntry => {
  const cycleDuration = level.weather.conditions.reduce(
    (sum, condition) => sum + condition.duration_s,
    0,
  );

  if (cycleDuration <= 0) {
    return level.weather.conditions[0];
  }

  const wrapped = elapsedTimeS % cycleDuration;
  let accumulated = 0;

  for (const condition of level.weather.conditions) {
    accumulated += condition.duration_s;
    if (wrapped <= accumulated + ROUNDING.EPSILON) {
      return condition;
    }
  }

  return level.weather.conditions[level.weather.conditions.length - 1];
};

const getTyrePropertyById = (level: LevelConfig, tyreId: number): TyreProperty => {
  const matchingSet = level.tyres.available_sets.find((set) => set.ids.includes(tyreId));

  if (!matchingSet) {
    throw new Error(`Unknown tyre id ${tyreId}.`);
  }

  return level.tyres.properties[matchingSet.compound];
};

const getWeatherFrictionMultiplier = (
  tyre: TyreProperty,
  weather: WeatherCondition,
): number => {
  if (weather === "cold") {
    return tyre.cold_friction_multiplier;
  }

  if (weather === "light_rain") {
    return tyre.light_rain_friction_multiplier;
  }

  if (weather === "heavy_rain") {
    return tyre.heavy_rain_friction_multiplier;
  }

  return tyre.dry_friction_multiplier;
};

const getWeatherDegradationRate = (
  tyre: TyreProperty,
  weather: WeatherCondition,
): number => {
  if (weather === "cold") {
    return tyre.cold_degradation;
  }

  if (weather === "light_rain") {
    return tyre.light_rain_degradation;
  }

  if (weather === "heavy_rain") {
    return tyre.heavy_rain_degradation;
  }

  return tyre.dry_degradation;
};

const getLapAction = (strategy: StrategyPlan, lap: number): StrategyLapAction => {
  const lapAction = strategy.laps.find((item) => item.lap === lap);

  if (!lapAction) {
    throw new Error(`Missing strategy for lap ${lap}.`);
  }

  return lapAction;
};

const getSegmentAction = (
  lapAction: StrategyLapAction,
  segmentId: number,
): StrategySegmentAction => {
  const action = lapAction.segments.find((segment) => segment.id === segmentId);

  if (!action) {
    throw new Error(`Missing action for segment ${segmentId} in lap ${lapAction.lap}.`);
  }

  return action;
};

const calculateFuelUsed = (
  initialSpeedMps: number,
  finalSpeedMps: number,
  distanceM: number,
): number => {
  const averageSpeed = (initialSpeedMps + finalSpeedMps) / 2;
  const rate =
    FUEL_CONSUMPTION.K_BASE_L_PER_M +
    FUEL_CONSUMPTION.K_DRAG_L_PER_M * averageSpeed ** 2;

  return Math.max(0, rate * distanceM);
};

const calculateScore = (
  level: LevelConfig,
  totalTimeS: number,
  fuelUsedL: number,
  totalTyreDegradation: number,
  blowouts: number,
): SimulationScoreBreakdown => {
  const safeTime = Math.max(totalTimeS, ROUNDING.EPSILON);
  const baseScore =
    500000 * (level.race.time_reference_s / safeTime) ** 3;

  const fuelRatio = safeDiv(fuelUsedL, level.race.fuel_soft_cap_limit_l);
  const fuelBonus = -500000 * (1 - fuelRatio) ** 2 + 500000;

  const tyreBonus = 100000 * totalTyreDegradation - 50000 * blowouts;

  return {
    base_score: round(baseScore),
    fuel_bonus: round(fuelBonus),
    tyre_bonus: round(tyreBonus),
    final_score: round(baseScore + fuelBonus + tyreBonus),
  };
};

export const simulateRace = (
  level: LevelConfig,
  strategy: StrategyPlan,
): SimulationResult => {
  const warnings: string[] = [];

  let elapsedTimeS = 0;
  let fuelL = level.car.initial_fuel_l;
  let currentSpeedMps = 0;
  let tyreId = strategy.initial_tyre_id;
  let tyreProperty = getTyrePropertyById(level, tyreId);
  let tyreDegradation = 0;

  let limpMode = false;
  let crawlMode = false;

  let crashes = 0;
  let blowouts = 0;
  let cumulativeFuelUsedL = 0;
  let cumulativeTyreDegradation = 0;

  const segmentResults: SimulationResult["segments"] = [];

  for (let lap = 1; lap <= level.race.laps; lap += 1) {
    const lapAction = getLapAction(strategy, lap);

    for (const segment of level.track.segments) {
      const action = getSegmentAction(lapAction, segment.id);
      const weather = findWeatherAtTime(level, elapsedTimeS);
      const weatherCondition = weather.condition;

      const tyreRate = getWeatherDegradationRate(tyreProperty, weatherCondition);
      const frictionMultiplier = getWeatherFrictionMultiplier(
        tyreProperty,
        weatherCondition,
      );

      let segmentTimeS = 0;
      let crashInSegment = false;
      let entrySpeedMps = currentSpeedMps;
      let exitSpeedMps = currentSpeedMps;

      if (segment.type === "straight") {
        if (crawlMode) {
          crawlMode = false;
        }

        if (limpMode) {
          const limpSpeed = level.car["limp_constant_m/s"];
          entrySpeedMps = limpSpeed;
          exitSpeedMps = limpSpeed;
          segmentTimeS = safeDiv(segment.length_m, limpSpeed);
        } else {
          if (action.type !== "straight") {
            throw new Error(
              `Segment ${segment.id} is straight but strategy action type is ${action.type}.`,
            );
          }

          const maxSpeed = level.car["max_speed_m/s"];
          const targetSpeedMps = clamp(action["target_m/s"], 0, maxSpeed);
          const brakingDistanceM = clamp(
            action.brake_start_m_before_next,
            0,
            segment.length_m,
          );

          const preBrakeDistanceM = segment.length_m - brakingDistanceM;
          const accelMps2 = level.car["accel_m/se2"] * weather.acceleration_multiplier;
          const brakeMps2 = level.car["brake_m/se2"] * weather.deceleration_multiplier;

          let speedAtBrakeStartMps = entrySpeedMps;
          let preBrakeTimeS = 0;

          if (targetSpeedMps <= entrySpeedMps + ROUNDING.EPSILON) {
            speedAtBrakeStartMps = entrySpeedMps;
            preBrakeTimeS = safeDiv(preBrakeDistanceM, Math.max(entrySpeedMps, level.car["crawl_constant_m/s"]));
          } else {
            const distanceToTargetM =
              (targetSpeedMps ** 2 - entrySpeedMps ** 2) / (2 * accelMps2);

            if (distanceToTargetM >= preBrakeDistanceM) {
              speedAtBrakeStartMps = Math.sqrt(
                Math.max(0, entrySpeedMps ** 2 + 2 * accelMps2 * preBrakeDistanceM),
              );
              preBrakeTimeS = safeDiv(speedAtBrakeStartMps - entrySpeedMps, accelMps2);
            } else {
              speedAtBrakeStartMps = targetSpeedMps;
              const accelTimeS = safeDiv(targetSpeedMps - entrySpeedMps, accelMps2);
              const coastingDistanceM = preBrakeDistanceM - distanceToTargetM;
              const coastTimeS = safeDiv(coastingDistanceM, Math.max(targetSpeedMps, ROUNDING.EPSILON));
              preBrakeTimeS = accelTimeS + coastTimeS;
            }
          }

          const brakingTimeS =
            brakingDistanceM > 0
              ? safeDiv(
                  speedAtBrakeStartMps - Math.sqrt(Math.max(0, speedAtBrakeStartMps ** 2 - 2 * brakeMps2 * brakingDistanceM)),
                  Math.max(brakeMps2, ROUNDING.EPSILON),
                )
              : 0;

          exitSpeedMps =
            brakingDistanceM > 0
              ? Math.sqrt(
                  Math.max(0, speedAtBrakeStartMps ** 2 - 2 * brakeMps2 * brakingDistanceM),
                )
              : speedAtBrakeStartMps;

          segmentTimeS = preBrakeTimeS + brakingTimeS;

          const straightDeg =
            tyreRate * segment.length_m * TYRE_DEGRADATION_COEFFICIENTS.K_STRAIGHT;

          const brakingDeg =
            ((speedAtBrakeStartMps / 100) ** 2 - (exitSpeedMps / 100) ** 2) *
            TYRE_DEGRADATION_COEFFICIENTS.K_BRAKING *
            tyreRate;

          const addedDeg = Math.max(0, straightDeg + Math.max(0, brakingDeg));
          tyreDegradation += addedDeg;
          cumulativeTyreDegradation += addedDeg;
        }
      } else {
        if (action.type !== "corner") {
          throw new Error(
            `Segment ${segment.id} is corner but strategy action type is ${action.type}.`,
          );
        }

        if (limpMode) {
          const limpSpeed = level.car["limp_constant_m/s"];
          entrySpeedMps = limpSpeed;
          exitSpeedMps = limpSpeed;
          segmentTimeS = safeDiv(segment.length_m, limpSpeed);
        } else {
          const tyreFriction = Math.max(
            0,
            (tyreProperty.base_friction_coefficient - tyreDegradation) * frictionMultiplier,
          );

          const maxCornerSpeedMps =
            Math.sqrt(Math.max(0, tyreFriction * GRAVITY_MPS2 * segment.radius_m)) +
            level.car["crawl_constant_m/s"];

          if (entrySpeedMps > maxCornerSpeedMps + ROUNDING.EPSILON) {
            crashInSegment = true;
            crashes += 1;
            crawlMode = true;
            tyreDegradation += 0.1;
            cumulativeTyreDegradation += 0.1;
            elapsedTimeS += level.race.corner_crash_penalty_s;
            warnings.push(
              `Crash on lap ${lap}, corner ${segment.id}: entry speed ${round(entrySpeedMps)} m/s > max ${round(maxCornerSpeedMps)} m/s.`,
            );
          }

          const cornerSpeedMps = crashInSegment || crawlMode
            ? level.car["crawl_constant_m/s"]
            : Math.max(entrySpeedMps, level.car["crawl_constant_m/s"]);

          exitSpeedMps = cornerSpeedMps;
          segmentTimeS = safeDiv(segment.length_m, cornerSpeedMps);

          const cornerDeg =
            TYRE_DEGRADATION_COEFFICIENTS.K_CORNER *
            safeDiv(cornerSpeedMps ** 2, segment.radius_m) *
            tyreRate;

          const addedDeg = Math.max(0, cornerDeg);
          tyreDegradation += addedDeg;
          cumulativeTyreDegradation += addedDeg;
        }
      }

      const fuelUsedL = limpMode
        ? 0
        : calculateFuelUsed(entrySpeedMps, exitSpeedMps, segment.length_m);

      fuelL = Math.max(0, fuelL - fuelUsedL);
      cumulativeFuelUsedL += fuelUsedL;

      if (!limpMode && fuelL <= ROUNDING.EPSILON) {
        limpMode = true;
        warnings.push(
          `Fuel depleted on lap ${lap}, segment ${segment.id}; limp mode activated.`,
        );
      }

      if (!limpMode && tyreDegradation >= tyreProperty.life_span - ROUNDING.EPSILON) {
        limpMode = true;
        blowouts += 1;
        warnings.push(
          `Tyre blowout on lap ${lap}, segment ${segment.id}; limp mode activated.`,
        );
      }

      elapsedTimeS += segmentTimeS;
      currentSpeedMps = exitSpeedMps;

      segmentResults.push({
        lap,
        segment_id: segment.id,
        segment_type: segment.type,
        weather: weatherCondition,
        entry_speed_mps: round(entrySpeedMps),
        exit_speed_mps: round(exitSpeedMps),
        segment_time_s: round(segmentTimeS),
        fuel_after_l: round(fuelL),
        tyre_degradation_after: round(tyreDegradation),
        crashed: crashInSegment,
        limp_mode: limpMode,
        crawl_mode: crawlMode,
      });
    }

    if (lapAction.pit.enter) {
      const refuelL = Math.max(0, lapAction.pit.fuel_refuel_amount_l ?? 0);
      const tyreChange = lapAction.pit.tyre_change_set_id !== undefined;

      const pitTimeS =
        level.race.base_pit_stop_time_s +
        safeDiv(refuelL, level.race["pit_refuel_rate_l/s"]) +
        (tyreChange ? level.race.pit_tyre_swap_time_s : 0);

      elapsedTimeS += pitTimeS;

      if (refuelL > 0) {
        fuelL = Math.min(level.car.fuel_tank_capacity_l, fuelL + refuelL);
      }

      if (tyreChange) {
        const nextTyreId = lapAction.pit.tyre_change_set_id as number;
        tyreId = nextTyreId;
        tyreProperty = getTyrePropertyById(level, nextTyreId);
        tyreDegradation = 0;
      }

      currentSpeedMps = level.race["pit_exit_speed_m/s"];

      if (fuelL > ROUNDING.EPSILON && tyreDegradation < tyreProperty.life_span) {
        limpMode = false;
      }
    }
  }

  const score = calculateScore(
    level,
    elapsedTimeS,
    cumulativeFuelUsedL,
    cumulativeTyreDegradation,
    blowouts,
  );

  return {
    total_time_s: round(elapsedTimeS),
    fuel_used_l: round(cumulativeFuelUsedL),
    fuel_remaining_l: round(fuelL),
    total_tyre_degradation: round(cumulativeTyreDegradation),
    blowouts,
    crashes,
    score,
    segments: segmentResults,
    warnings,
  };
};
