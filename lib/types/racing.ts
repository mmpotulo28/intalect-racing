export type WeatherCondition = "dry" | "cold" | "light_rain" | "heavy_rain";

export type TyreCompound = "Soft" | "Medium" | "Hard" | "Intermediate" | "Wet";

export interface CarConfig {
	"max_speed_m/s": number;
	"accel_m/se2": number;
	"brake_m/se2": number;
	"limp_constant_m/s": number;
	"crawl_constant_m/s": number;
	fuel_tank_capacity_l: number;
	initial_fuel_l: number;
}

export interface RaceConfig {
	name: string;
	laps: number;
	base_pit_stop_time_s: number;
	pit_tyre_swap_time_s: number;
	"pit_refuel_rate_l/s": number;
	corner_crash_penalty_s: number;
	"pit_exit_speed_m/s": number;
	fuel_soft_cap_limit_l: number;
	starting_weather_condition_id: number;
	time_reference_s: number;
}

export interface StraightSegment {
	id: number;
	type: "straight";
	length_m: number;
}

export interface CornerSegment {
	id: number;
	type: "corner";
	length_m: number;
	radius_m: number;
}

export type TrackSegment = StraightSegment | CornerSegment;

export interface TrackConfig {
	name: string;
	segments: TrackSegment[];
}

export interface TyreProperty {
	base_friction_coefficient: number;
	life_span: number;
	dry_friction_multiplier: number;
	cold_friction_multiplier: number;
	light_rain_friction_multiplier: number;
	heavy_rain_friction_multiplier: number;
	dry_degradation: number;
	cold_degradation: number;
	light_rain_degradation: number;
	heavy_rain_degradation: number;
}

export type TyrePropertiesByCompound = Record<TyreCompound, TyreProperty>;

export interface TyreAvailableSet {
	ids: number[];
	compound: TyreCompound;
}

export interface TyreConfig {
	properties: TyrePropertiesByCompound;
	available_sets: TyreAvailableSet[];
}

export interface WeatherEntry {
	id: number;
	condition: WeatherCondition;
	duration_s: number;
	acceleration_multiplier: number;
	deceleration_multiplier: number;
}

export interface WeatherConfig {
	conditions: WeatherEntry[];
}

export interface LevelConfig {
	car: CarConfig;
	race: RaceConfig;
	track: TrackConfig;
	tyres: TyreConfig;
	weather: WeatherConfig;
}

export interface StrategyStraightAction {
	id: number;
	type: "straight";
	"target_m/s": number;
	brake_start_m_before_next: number;
}

export interface StrategyCornerAction {
	id: number;
	type: "corner";
}

export type StrategySegmentAction = StrategyStraightAction | StrategyCornerAction;

export interface LapPitAction {
	enter: boolean;
	tyre_change_set_id?: number;
	fuel_refuel_amount_l?: number;
}

export interface StrategyLapAction {
	lap: number;
	segments: StrategySegmentAction[];
	pit: LapPitAction;
}

export interface StrategyPlan {
	initial_tyre_id: number;
	laps: StrategyLapAction[];
}

export interface ValidationIssue {
	path: string;
	message: string;
}

export interface ValidationResult<T> {
	ok: boolean;
	data?: T;
	issues?: ValidationIssue[];
}

export interface SimulationSegmentResult {
	lap: number;
	segment_id: number;
	segment_type: TrackSegment["type"];
	weather: WeatherCondition;
	entry_speed_mps: number;
	exit_speed_mps: number;
	segment_time_s: number;
	fuel_after_l: number;
	tyre_degradation_after: number;
	crashed: boolean;
	limp_mode: boolean;
	crawl_mode: boolean;
}

export interface SimulationScoreBreakdown {
	base_score: number;
	fuel_bonus: number;
	tyre_bonus: number;
	final_score: number;
}

export interface SimulationResult {
	total_time_s: number;
	fuel_used_l: number;
	fuel_remaining_l: number;
	total_tyre_degradation: number;
	blowouts: number;
	crashes: number;
	score: SimulationScoreBreakdown;
	segments: SimulationSegmentResult[];
	warnings: string[];
}
