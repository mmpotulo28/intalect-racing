import { GeneticOptimizer, type OptimizerConfig, type OptimizerCandidate } from "./genetic";
import type { LevelConfig } from "@/lib/types/racing";

// Setup for standard Web Worker message passing model
export type OptimizerProgressEvent = {
	type: "progress";
	generation: number;
	bestFitness: number;
	bestCandidate: OptimizerCandidate | null;
};

export type OptimizerCompleteEvent = {
	type: "complete";
	bestCandidate: OptimizerCandidate;
};

export type OptimizerMessageEvent = OptimizerProgressEvent | OptimizerCompleteEvent;

addEventListener("message", (event: MessageEvent) => {
	const { level, config } = event.data as { level: LevelConfig; config: OptimizerConfig };

	const optimizer = new GeneticOptimizer(level, config);

	let population = Array.from({ length: config.populationSize }).map(() => optimizer.createRandomCandidate());

	let bestCandidate: OptimizerCandidate | null = null;

	for (let generation = 1; generation <= config.generations; generation++) {
		const { nextGen, best } = optimizer.runGeneration(population);
		population = nextGen;

		if (!bestCandidate || best.fitness > bestCandidate.fitness) {
			bestCandidate = JSON.parse(JSON.stringify(best));
		}

		// Send progress every generation (or throttle if generations > 1000)
		postMessage({
			type: "progress",
			generation,
			bestFitness: best.fitness,
			bestCandidate: best,
		} satisfies OptimizerProgressEvent);
	}

	if (bestCandidate) {
		postMessage({
			type: "complete",
			bestCandidate,
		} satisfies OptimizerCompleteEvent);
	}
});
