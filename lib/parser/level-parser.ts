import type { LevelConfig } from "@/lib/types/racing";
import { validateLevelConfig } from "@/lib/validation/schemas";

const formatIssues = (issues?: { path: string; message: string }[]): string => {
	if (!issues || issues.length === 0) {
		return "Unknown validation error.";
	}

	return issues.map((issue) => `${issue.path}: ${issue.message}`).join("; ");
};

const normalizeLegacyLevelShape = (raw: Record<string, unknown>): Record<string, unknown> => {
	const normalized = { ...raw };

	if (!normalized.weather && normalized.tyres && typeof normalized.tyres === "object" && normalized.tyres !== null && "weather" in normalized.tyres) {
		const tyres = normalized.tyres as Record<string, unknown>;
		normalized.weather = tyres.weather;
		delete tyres.weather;
		normalized.tyres = tyres;
	}

	if (normalized.race && typeof normalized.race === "object" && normalized.race !== null) {
		const race = { ...(normalized.race as Record<string, unknown>) };

		if (!race["time_reference_s"] && race.time_reference) {
			race["time_reference_s"] = race.time_reference;
			delete race.time_reference;
		}

		if (!race["fuel_soft_cap_limit_l"] && race.fuel_soft_cap_limit) {
			race["fuel_soft_cap_limit_l"] = race.fuel_soft_cap_limit;
			delete race.fuel_soft_cap_limit;
		}

		normalized.race = race;
	}

	return normalized;
};

export const parseLevelConfig = (input: unknown): LevelConfig => {
	const raw = typeof input === "string" ? (JSON.parse(input) as Record<string, unknown>) : (input as Record<string, unknown>);
	const normalized = normalizeLegacyLevelShape(raw);
	const result = validateLevelConfig(normalized);

	if (!result.ok || !result.data) {
		throw new Error(`Invalid level config: ${formatIssues(result.issues)}`);
	}

	return result.data;
};
