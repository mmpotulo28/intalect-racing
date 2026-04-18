import { z } from "zod";

import type { LevelConfig, StrategyPlan, ValidationIssue, ValidationResult } from "@/lib/types/racing";

const weatherConditionSchema = z.enum(["dry", "cold", "light_rain", "heavy_rain"]);
const tyreCompoundSchema = z.enum(["Soft", "Medium", "Hard", "Intermediate", "Wet"]);

const carSchema = z.object({
	"max_speed_m/s": z.number().positive(),
	"accel_m/se2": z.number().positive(),
	"brake_m/se2": z.number().positive(),
	"limp_constant_m/s": z.number().positive(),
	"crawl_constant_m/s": z.number().positive(),
	fuel_tank_capacity_l: z.number().positive(),
	initial_fuel_l: z.number().nonnegative(),
});

const raceSchema = z.object({
	name: z.string().min(1),
	laps: z.number().int().positive(),
	base_pit_stop_time_s: z.number().nonnegative(),
	pit_tyre_swap_time_s: z.number().nonnegative(),
	"pit_refuel_rate_l/s": z.number().positive(),
	corner_crash_penalty_s: z.number().nonnegative(),
	"pit_exit_speed_m/s": z.number().nonnegative(),
	fuel_soft_cap_limit_l: z.number().positive(),
	starting_weather_condition_id: z.number().int().positive(),
	time_reference_s: z.number().positive(),
});

const straightSegmentSchema = z.object({
	id: z.number().int().positive(),
	type: z.literal("straight"),
	length_m: z.number().positive(),
});

const cornerSegmentSchema = z.object({
	id: z.number().int().positive(),
	type: z.literal("corner"),
	length_m: z.number().positive(),
	radius_m: z.number().positive(),
});

const trackSchema = z.object({
	name: z.string().min(1),
	segments: z.array(z.union([straightSegmentSchema, cornerSegmentSchema])).min(1),
});

const tyrePropertySchema = z.object({
	base_friction_coefficient: z.number().positive().optional().default(1.0),
	life_span: z.number().positive(),
	dry_friction_multiplier: z.number().positive(),
	cold_friction_multiplier: z.number().positive(),
	light_rain_friction_multiplier: z.number().positive(),
	heavy_rain_friction_multiplier: z.number().positive(),
	dry_degradation: z.number().nonnegative(),
	cold_degradation: z.number().nonnegative(),
	light_rain_degradation: z.number().nonnegative(),
	heavy_rain_degradation: z.number().nonnegative(),
});

const tyrePropertiesSchema = z.object({
	Soft: tyrePropertySchema,
	Medium: tyrePropertySchema,
	Hard: tyrePropertySchema,
	Intermediate: tyrePropertySchema,
	Wet: tyrePropertySchema,
});

const tyreSetSchema = z.object({
	ids: z.array(z.number().int().positive()).min(1),
	compound: tyreCompoundSchema,
});

const tyresSchema = z.object({
	properties: tyrePropertiesSchema,
	available_sets: z.array(tyreSetSchema).min(1),
});

const weatherEntrySchema = z.object({
	id: z.number().int().positive(),
	condition: weatherConditionSchema,
	duration_s: z.number().positive(),
	acceleration_multiplier: z.number().positive(),
	deceleration_multiplier: z.number().positive(),
});

const weatherSchema = z.object({
	conditions: z.array(weatherEntrySchema).min(1),
});

export const levelSchema = z.preprocess(
	(val: any) => {
		// Handle case where available_sets is at the root instead of inside tyres
		if (val && typeof val === "object" && val.available_sets && val.tyres && !val.tyres.available_sets) {
			val.tyres.available_sets = val.available_sets;
		}
		return val;
	},
	z.object({
		car: carSchema,
		race: raceSchema,
		track: trackSchema,
		tyres: tyresSchema,
		weather: weatherSchema,
	}),
);

const strategyStraightSchema = z.object({
	id: z.number().int().positive(),
	type: z.literal("straight"),
	"target_m/s": z.number().nonnegative(),
	brake_start_m_before_next: z.number().nonnegative(),
});

const strategyCornerSchema = z.object({
	id: z.number().int().positive(),
	type: z.literal("corner"),
});

const pitSchema = z.object({
	enter: z.boolean(),
	tyre_change_set_id: z.number().int().positive().optional(),
	fuel_refuel_amount_l: z.number().nonnegative().optional(),
});

const strategyLapSchema = z.object({
	lap: z.number().int().positive(),
	segments: z.array(z.union([strategyStraightSchema, strategyCornerSchema])).min(1),
	pit: pitSchema,
});

export const strategySchema = z.object({
	initial_tyre_id: z.number().int().positive(),
	laps: z.array(strategyLapSchema).min(1),
});

const toIssues = (error: z.ZodError): ValidationIssue[] =>
	error.issues.map((issue) => ({
		path: issue.path.join("."),
		message: issue.message,
	}));

const validateUniqueTrackSegmentIds = (level: LevelConfig): ValidationIssue[] => {
	const ids = level.track.segments.map((segment) => segment.id);
	const unique = new Set(ids);

	if (unique.size !== ids.length) {
		return [{ path: "track.segments", message: "Track segment ids must be unique." }];
	}

	return [];
};

const validateTyreAvailability = (level: LevelConfig): ValidationIssue[] => {
	const issues: ValidationIssue[] = [];
	const seen = new Set<number>();

	level.tyres.available_sets.forEach((set, setIndex) => {
		set.ids.forEach((id, idIndex) => {
			if (seen.has(id)) {
				issues.push({
					path: `tyres.available_sets.${setIndex}.ids.${idIndex}`,
					message: `Tyre id ${id} is duplicated across available sets.`,
				});
			}
			seen.add(id);
		});
	});

	return issues;
};

const validateFuelBoundaries = (level: LevelConfig): ValidationIssue[] => {
	if (level.car["initial_fuel_l"] > level.car["fuel_tank_capacity_l"]) {
		return [
			{
				path: "car.initial_fuel_l",
				message: "Initial fuel cannot exceed tank capacity.",
			},
		];
	}

	return [];
};

export const validateLevelConfig = (input: unknown): ValidationResult<LevelConfig> => {
	const parsed = levelSchema.safeParse(input);

	if (!parsed.success) {
		return { ok: false, issues: toIssues(parsed.error) };
	}

	const level = parsed.data as LevelConfig;
	const semanticIssues: ValidationIssue[] = [...validateUniqueTrackSegmentIds(level), ...validateTyreAvailability(level), ...validateFuelBoundaries(level)];

	if (semanticIssues.length > 0) {
		return { ok: false, issues: semanticIssues };
	}

	return { ok: true, data: level };
};

export const validateStrategyPlan = (input: unknown): ValidationResult<StrategyPlan> => {
	const parsed = strategySchema.safeParse(input);

	if (!parsed.success) {
		return { ok: false, issues: toIssues(parsed.error) };
	}

	return { ok: true, data: parsed.data as StrategyPlan };
};
