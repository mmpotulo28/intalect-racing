import type { StrategyPlan } from "@/lib/types/racing";
import { validateStrategyPlan } from "@/lib/validation/schemas";

const formatIssues = (issues?: { path: string; message: string }[]): string => {
	if (!issues || issues.length === 0) {
		return "Unknown validation error.";
	}

	return issues.map((issue) => `${issue.path}: ${issue.message}`).join("; ");
};

export const parseStrategyPlan = (input: unknown): StrategyPlan => {
	const raw = typeof input === "string" ? JSON.parse(input) : input;
	const result = validateStrategyPlan(raw);

	if (!result.ok || !result.data) {
		throw new Error(`Invalid strategy plan: ${formatIssues(result.issues)}`);
	}

	return result.data;
};
