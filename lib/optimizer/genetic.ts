import type { LevelConfig, StrategyPlan, StrategyLapAction, StrategySegmentAction } from "@/lib/types/racing";
import { simulateRace } from "@/lib/simulation/engine";

// Strict Deterministic PRNG to ensure the Genetic Algorithm is 100% reproducible per seed
export class DeterministicPRNG {
        private state: number;

        constructor(seed: number) {
                this.state = seed ? seed : 123456789;
        }

        // Linear Congruential Generator (LCG)
        next(): number {
                this.state = (this.state * 1664525 + 1013904223) % 4294967296;
                return this.state / 4294967296;
        }

        nextRange(min: number, max: number): number {
                return min + (max - min) * this.next();
        }

        nextInt(min: number, max: number): number {
                return Math.floor(this.nextRange(min, max));
        }

        pick<T>(array: T[]): T {
                return array[this.nextInt(0, array.length)];
        }
}

export interface OptimizerConfig {
        populationSize: number;
        generations: number;
        mutationRate: number;
        crossoverRate: number;
        seed: number;
}

export interface OptimizerCandidate {
        plan: StrategyPlan;
        fitness: number;
        valid: boolean;
        crashes: number;
}

export class GeneticOptimizer {
        private prng: DeterministicPRNG;

        constructor(
                private level: LevelConfig,
                private config: OptimizerConfig,
        ) {
                this.prng = new DeterministicPRNG(config.seed);
        }

        // Strategy encoding and decoding goes here
        public runGeneration(population: OptimizerCandidate[]): { nextGen: OptimizerCandidate[]; best: OptimizerCandidate } {
                // Evaluate fitness
                for (const candidate of population) {
                        if (candidate.fitness === -1) {
                                const result = simulateRace(this.level, candidate.plan);
                                candidate.fitness = result.score.final_score;
                                candidate.crashes = result.crashes || 0;
                                candidate.valid = candidate.crashes === 0 && result.blowouts === 0 && result.fuel_remaining_l >= 0; 
                        }
                }

                // Deterministic sort for selection: Highest fitness first, tie-break by crashes, then by fuel used
                population.sort((a, b) => {
                        if (b.fitness !== a.fitness) return b.fitness - a.fitness;
                        if (a.crashes !== b.crashes) return a.crashes - b.crashes;
                        return 0; // Fallback to stable array index (done automatically by V8 but we can be explicit if needed)
                });

                const best = population[0];

                const nextGen: OptimizerCandidate[] = [];
                // Elitism: carry over the best candidate
                nextGen.push(best);

                // Placeholder for Tournament Selection & Crossover
                while (nextGen.length < this.config.populationSize) {
                        const parentA = this.tournamentSelection(population);
                        const parentB = this.tournamentSelection(population);

                        let childPlan = parentA.plan; // Defaults to clone in deep array 

                        if (this.prng.next() < this.config.crossoverRate) {
                                childPlan = this.crossover(parentA.plan, parentB.plan);
                        }

                        if (this.prng.next() < this.config.mutationRate) {
                                childPlan = this.mutate(childPlan);
                        }

                        nextGen.push({ plan: childPlan, fitness: -1, valid: false, crashes: 0 });
                }

                return { nextGen, best };
        }

        private tournamentSelection(population: OptimizerCandidate[]): OptimizerCandidate {
                const tournamentSize = 3;
                let best = this.prng.pick(population);
                for (let i = 1; i < tournamentSize; i++) {
                        const contender = this.prng.pick(population);
                        if (contender.fitness > best.fitness) {
                                best = contender;
                        } else if (contender.fitness === best.fitness && contender.crashes < best.crashes) {
                                best = contender;
                        }
                }
                return best;
        }

        private crossover(parentA: StrategyPlan, parentB: StrategyPlan): StrategyPlan {
                // Single-point lap crossover
                const splitPoint = this.prng.nextInt(1, parentA.laps.length);
                const childLaps = [
                        ...JSON.parse(JSON.stringify(parentA.laps.slice(0, splitPoint))),
                        ...JSON.parse(JSON.stringify(parentB.laps.slice(splitPoint))),
                ];

                return {
                        initial_tyre_id: this.prng.next() < 0.5 ? parentA.initial_tyre_id : parentB.initial_tyre_id,
                        laps: childLaps,
                };
        }

        private mutate(plan: StrategyPlan): StrategyPlan {
                const mutated = JSON.parse(JSON.stringify(plan)) as StrategyPlan;
                
                // Mutate a random lap
                const lapIndex = this.prng.nextInt(0, mutated.laps.length);
                const lap = mutated.laps[lapIndex];

                // Mutate speed target
                const straights = lap.segments.filter(s => s.type === "straight");
                if (straights.length > 0) {
                        const targetStraight = this.prng.pick(straights) as any; // Cast as we know type
                        targetStraight["target_m/s"] += this.prng.nextRange(-10, 10);
                        targetStraight["target_m/s"] = Math.max(10, Math.min(this.level.car["max_speed_m/s"], targetStraight["target_m/s"]));
                }

                // Mutate pit decision occasionally
                if (this.prng.next() < 0.1) {
                        lap.pit.enter = !lap.pit.enter;
                        if (lap.pit.enter) {
                                const sets = this.level.tyres.available_sets;
                                const randomSet = this.prng.pick(sets);
                                lap.pit.tyre_change_set_id = this.prng.pick(randomSet.ids);
                                lap.pit.fuel_refuel_amount_l = this.prng.nextRange(10, this.level.car.fuel_tank_capacity_l);
                        } else {
                                lap.pit.tyre_change_set_id = undefined;
                                lap.pit.fuel_refuel_amount_l = undefined;
                        }
                }

                return mutated;
        }

        public createRandomCandidate(): OptimizerCandidate {
            // Generates a fully legal default strategy to bootstrap the initial pool
            const plan: StrategyPlan = {
                initial_tyre_id: this.level.tyres.available_sets[0].ids[0],
                laps: []
            };

            for (let i = 1; i <= this.level.race.laps; i++) {
                plan.laps.push({
                    lap: i,
                    segments: this.level.track.segments.map(seg => {
                        if (seg.type === "straight") {
                            return { id: seg.id, type: "straight", "target_m/s": this.level.car["max_speed_m/s"] * 0.8, brake_start_m_before_next: 50 };
                        }
                        return { id: seg.id, type: "corner" };
                    }),
                    pit: { enter: false }
                });
            }

            return { plan, fitness: -1, valid: false, crashes: 0 };
        }
}
