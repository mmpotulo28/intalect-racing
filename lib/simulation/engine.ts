import { FUEL_CONSUMPTION, GRAVITY_MPS2, ROUNDING, TYRE_DEGRADATION_COEFFICIENTS } from "@/lib/constants/race";
import type { LevelConfig, SimulationResult, SimulationScoreBreakdown, StrategyLapAction, StrategyPlan, StrategySegmentAction, TyreProperty, WeatherCondition, WeatherEntry } from "@/lib/types/racing";

interface EngineState {
	elapsedTimeS: number;
	fuelL: number;
	currentSpeedMps: number;
	tyreProperty: TyreProperty;
	tyreDegradation: number;
	limpMode: boolean;
	crawlMode: boolean;
	crashes: number;
	blowouts: number;
	cumulativeFuelUsedL: number;
	cumulativeTyreDegradation: number;
	warnings: string[];
	segments: SimulationResult["segments"];
}

interface SegmentOutcome {
	entrySpeedMps: number;
	exitSpeedMps: number;
	segmentTimeS: number;
	crashed: boolean;
	addedDegradation: number;
}

interface CornerSimulationArgs {
	level: LevelConfig;
	state: EngineState;
	frictionMultiplier: number;
	tyreRate: number;
	lap: number;
	segmentId: number;
	segmentLengthM: number;
	radiusM: number;
}

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

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
	const cycleDuration = level.weather.conditions.reduce((sum, condition) => sum + condition.duration_s, 0);

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

const getWeatherFrictionMultiplier = (tyre: TyreProperty, weather: WeatherCondition): number => {
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

const getWeatherDegradationRate = (tyre: TyreProperty, weather: WeatherCondition): number => {
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

const getSegmentAction = (lapAction: StrategyLapAction, segmentId: number): StrategySegmentAction => {
	const action = lapAction.segments.find((segment) => segment.id === segmentId);

	if (!action) {
		throw new Error(`Missing action for segment ${segmentId} in lap ${lapAction.lap}.`);
	}

	return action;
};

const calculateFuelUsed = (initialSpeedMps: number, finalSpeedMps: number, distanceM: number): number => {
	const averageSpeed = (initialSpeedMps + finalSpeedMps) / 2;
	const rate = FUEL_CONSUMPTION.K_BASE_L_PER_M + FUEL_CONSUMPTION.K_DRAG_L_PER_M * averageSpeed ** 2;

	return Math.max(0, rate * distanceM);
};

const calculateScore = (level: LevelConfig, totalTimeS: number, fuelUsedL: number, totalTyreDegradation: number, blowouts: number): SimulationScoreBreakdown => {
	const safeTime = Math.max(totalTimeS, ROUNDING.EPSILON);
	const baseScore = 500000 * (level.race.time_reference_s / safeTime) ** 3;

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

const initEngineState = (level: LevelConfig, strategy: StrategyPlan): EngineState => ({
	elapsedTimeS: 0,
	fuelL: level.car.initial_fuel_l,
	currentSpeedMps: 0,
	tyreProperty: getTyrePropertyById(level, strategy.initial_tyre_id),
	tyreDegradation: 0,
	limpMode: false,
	crawlMode: false,
	crashes: 0,
	blowouts: 0,
	cumulativeFuelUsedL: 0,
	cumulativeTyreDegradation: 0,
	warnings: [],
	segments: [],
});

const simulateStraightSegment = (level: LevelConfig, state: EngineState, action: StrategySegmentAction, weather: WeatherEntry, tyreRate: number, segmentLengthM: number): SegmentOutcome => {
	if (action.type !== "straight") {
		throw new Error("Expected straight action for straight segment.");
	}

	if (state.crawlMode) {
		state.crawlMode = false;
	}

	const entrySpeedMps = state.limpMode ? level.car["limp_constant_m/s"] : state.currentSpeedMps;

	if (state.limpMode) {
		return {
			entrySpeedMps,
			exitSpeedMps: entrySpeedMps,
			segmentTimeS: safeDiv(segmentLengthM, entrySpeedMps),
			crashed: false,
			addedDegradation: 0,
		};
	}

	const maxSpeed = level.car["max_speed_m/s"];
	const targetSpeedMps = clamp(action["target_m/s"], 0, maxSpeed);
	const brakingDistanceM = clamp(action.brake_start_m_before_next, 0, segmentLengthM);
	const preBrakeDistanceM = segmentLengthM - brakingDistanceM;

	const accelMps2 = level.car["accel_m/se2"] * weather.acceleration_multiplier;
	const brakeMps2 = level.car["brake_m/se2"] * weather.deceleration_multiplier;

	let speedAtBrakeStartMps = entrySpeedMps;
	let preBrakeTimeS = 0;

	if (targetSpeedMps <= entrySpeedMps + ROUNDING.EPSILON) {
		preBrakeTimeS = safeDiv(preBrakeDistanceM, Math.max(entrySpeedMps, level.car["crawl_constant_m/s"]));
	} else {
		const distanceToTargetM = (targetSpeedMps ** 2 - entrySpeedMps ** 2) / (2 * accelMps2);

		if (distanceToTargetM >= preBrakeDistanceM) {
			speedAtBrakeStartMps = Math.sqrt(Math.max(0, entrySpeedMps ** 2 + 2 * accelMps2 * preBrakeDistanceM));
			preBrakeTimeS = safeDiv(speedAtBrakeStartMps - entrySpeedMps, accelMps2);
		} else {
			speedAtBrakeStartMps = targetSpeedMps;
			const accelTimeS = safeDiv(targetSpeedMps - entrySpeedMps, accelMps2);
			const coastingDistanceM = preBrakeDistanceM - distanceToTargetM;
			const coastTimeS = safeDiv(coastingDistanceM, Math.max(targetSpeedMps, ROUNDING.EPSILON));
			preBrakeTimeS = accelTimeS + coastTimeS;
		}
	}

	const exitSpeedMps = brakingDistanceM > 0 ? Math.sqrt(Math.max(0, speedAtBrakeStartMps ** 2 - 2 * brakeMps2 * brakingDistanceM)) : speedAtBrakeStartMps;

	const brakingTimeS = brakingDistanceM > 0 ? safeDiv(speedAtBrakeStartMps - exitSpeedMps, Math.max(brakeMps2, ROUNDING.EPSILON)) : 0;

	const straightDeg = tyreRate * segmentLengthM * TYRE_DEGRADATION_COEFFICIENTS.K_STRAIGHT;

	const brakingDeg = ((speedAtBrakeStartMps / 100) ** 2 - (exitSpeedMps / 100) ** 2) * TYRE_DEGRADATION_COEFFICIENTS.K_BRAKING * tyreRate;

	return {
		entrySpeedMps,
		exitSpeedMps,
		segmentTimeS: preBrakeTimeS + brakingTimeS,
		crashed: false,
		addedDegradation: Math.max(0, straightDeg + Math.max(0, brakingDeg)),
	};
};

const simulateCornerSegment = ({ level, state, frictionMultiplier, tyreRate, lap, segmentId, segmentLengthM, radiusM }: CornerSimulationArgs): SegmentOutcome => {
	const entrySpeedMps = state.limpMode ? level.car["limp_constant_m/s"] : state.currentSpeedMps;

	if (state.limpMode) {
		return {
			entrySpeedMps,
			exitSpeedMps: entrySpeedMps,
			segmentTimeS: safeDiv(segmentLengthM, entrySpeedMps),
			crashed: false,
			addedDegradation: 0,
		};
	}

	const tyreFriction = Math.max(0, (state.tyreProperty.base_friction_coefficient - state.tyreDegradation) * frictionMultiplier);

	const maxCornerSpeedMps = Math.sqrt(Math.max(0, tyreFriction * GRAVITY_MPS2 * radiusM)) + level.car["crawl_constant_m/s"];

	let crashed = false;
	let crashPenaltyDeg = 0;

	if (entrySpeedMps > maxCornerSpeedMps + ROUNDING.EPSILON) {
		crashed = true;
		state.crashes += 1;
		state.crawlMode = true;
		crashPenaltyDeg = 0.1;
		state.elapsedTimeS += level.race.corner_crash_penalty_s;
		state.warnings.push(`Crash on lap ${lap}, corner ${segmentId}: entry speed ${round(entrySpeedMps)} m/s > max ${round(maxCornerSpeedMps)} m/s.`);
	}

	const cornerSpeedMps = crashed || state.crawlMode ? level.car["crawl_constant_m/s"] : Math.max(entrySpeedMps, level.car["crawl_constant_m/s"]);

	const cornerDeg = TYRE_DEGRADATION_COEFFICIENTS.K_CORNER * safeDiv(cornerSpeedMps ** 2, radiusM) * tyreRate;

	return {
		entrySpeedMps,
		exitSpeedMps: cornerSpeedMps,
		segmentTimeS: safeDiv(segmentLengthM, cornerSpeedMps),
		crashed,
		addedDegradation: crashPenaltyDeg + Math.max(0, cornerDeg),
	};
};

const updateResourceModes = (level: LevelConfig, state: EngineState, lap: number, segmentId: number, fuelUsedL: number): void => {
	state.fuelL = Math.max(0, state.fuelL - fuelUsedL);
	state.cumulativeFuelUsedL += fuelUsedL;

	if (!state.limpMode && state.fuelL <= ROUNDING.EPSILON) {
		state.limpMode = true;
		state.warnings.push(`Fuel depleted on lap ${lap}, segment ${segmentId}; limp mode activated.`);
	}

	if (!state.limpMode && state.tyreDegradation >= state.tyreProperty.life_span - ROUNDING.EPSILON) {
		state.limpMode = true;
		state.blowouts += 1;
		state.warnings.push(`Tyre blowout on lap ${lap}, segment ${segmentId}; limp mode activated.`);
	}
};

const applyPitStop = (level: LevelConfig, state: EngineState, lapAction: StrategyLapAction): void => {
	if (!lapAction.pit.enter) {
		return;
	}

	const refuelL = Math.max(0, lapAction.pit.fuel_refuel_amount_l ?? 0);
	const tyreChange = lapAction.pit.tyre_change_set_id !== undefined;

	const pitTimeS = level.race.base_pit_stop_time_s + safeDiv(refuelL, level.race["pit_refuel_rate_l/s"]) + (tyreChange ? level.race.pit_tyre_swap_time_s : 0);

	state.elapsedTimeS += pitTimeS;

	if (refuelL > 0) {
		state.fuelL = Math.min(level.car.fuel_tank_capacity_l, state.fuelL + refuelL);
	}

	if (tyreChange) {
		const nextTyreId = lapAction.pit.tyre_change_set_id as number;
		state.tyreProperty = getTyrePropertyById(level, nextTyreId);
		state.tyreDegradation = 0;
	}

	state.currentSpeedMps = level.race["pit_exit_speed_m/s"];

	if (state.fuelL > ROUNDING.EPSILON && state.tyreDegradation < state.tyreProperty.life_span) {
		state.limpMode = false;
	}
};

const appendSegmentResult = (state: EngineState, lap: number, segmentId: number, segmentType: "straight" | "corner", weather: WeatherCondition, outcome: SegmentOutcome): void => {
	state.segments.push({
		lap,
		segment_id: segmentId,
		segment_type: segmentType,
		weather,
		entry_speed_mps: round(outcome.entrySpeedMps),
		exit_speed_mps: round(outcome.exitSpeedMps),
		segment_time_s: round(outcome.segmentTimeS),
		fuel_after_l: round(state.fuelL),
		tyre_degradation_after: round(state.tyreDegradation),
		crashed: outcome.crashed,
		limp_mode: state.limpMode,
		crawl_mode: state.crawlMode,
	});
};

export const simulateRace = (level: LevelConfig, strategy: StrategyPlan): SimulationResult => {
	const state = initEngineState(level, strategy);

	for (let lap = 1; lap <= level.race.laps; lap += 1) {
		const lapAction = getLapAction(strategy, lap);

		for (const segment of level.track.segments) {
			const action = getSegmentAction(lapAction, segment.id);
			const weather = findWeatherAtTime(level, state.elapsedTimeS);
			const tyreRate = getWeatherDegradationRate(state.tyreProperty, weather.condition);
			const frictionMultiplier = getWeatherFrictionMultiplier(state.tyreProperty, weather.condition);

			const outcome =
				segment.type === "straight"
					? simulateStraightSegment(level, state, action, weather, tyreRate, segment.length_m)
					: simulateCornerSegment({
							level,
							state,
							frictionMultiplier,
							tyreRate,
							lap,
							segmentId: segment.id,
							segmentLengthM: segment.length_m,
							radiusM: segment.radius_m,
						});

			state.tyreDegradation += outcome.addedDegradation;
			state.cumulativeTyreDegradation += outcome.addedDegradation;

			const fuelUsedL = state.limpMode ? 0 : calculateFuelUsed(outcome.entrySpeedMps, outcome.exitSpeedMps, segment.length_m);

			updateResourceModes(level, state, lap, segment.id, fuelUsedL);

			state.elapsedTimeS += outcome.segmentTimeS;
			state.currentSpeedMps = outcome.exitSpeedMps;

			appendSegmentResult(state, lap, segment.id, segment.type, weather.condition, outcome);
		}

		applyPitStop(level, state, lapAction);
	}

	const score = calculateScore(level, state.elapsedTimeS, state.cumulativeFuelUsedL, state.cumulativeTyreDegradation, state.blowouts);

	return {
		total_time_s: round(state.elapsedTimeS),
		fuel_used_l: round(state.cumulativeFuelUsedL),
		fuel_remaining_l: round(state.fuelL),
		total_tyre_degradation: round(state.cumulativeTyreDegradation),
		blowouts: state.blowouts,
		crashes: state.crashes,
		score,
		segments: state.segments,
		warnings: state.warnings,
	};
};
