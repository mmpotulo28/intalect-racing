import type { WeatherCondition } from "@/lib/types/racing";

export const GRAVITY_MPS2 = 9.8;

export const TYRE_DEGRADATION_COEFFICIENTS = {
	K_STRAIGHT: 0.0000166,
	K_BRAKING: 0.0398,
	K_CORNER: 0.000265,
} as const;

export const FUEL_CONSUMPTION = {
	K_BASE_L_PER_M: 0.0005,
	K_DRAG_L_PER_M: 0.0000000015,
} as const;

export const DEFAULT_WEATHER_CONDITION: WeatherCondition = "dry";

export const WEATHER_ORDER: WeatherCondition[] = ["dry", "cold", "light_rain", "heavy_rain"];

export const ROUNDING = {
	EPSILON: 1e-9,
	DECIMALS: 9,
} as const;
