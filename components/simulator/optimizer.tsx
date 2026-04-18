"use client";

import { useEffect, useState, useRef } from "react";
import { Card, Button } from "@heroui/react";
import type { LevelConfig, StrategyPlan } from "@/lib/types/racing";

interface OptimizerDashboardProps {
        level: LevelConfig | null;
        onStrategyFound: (plan: StrategyPlan) => void;
}

export function OptimizerDashboard({ level, onStrategyFound }: OptimizerDashboardProps) {
        const [isRunning, setIsRunning] = useState(false);
        const [progress, setProgress] = useState(0);
        const [bestScore, setBestScore] = useState(0);
        const [generation, setGeneration] = useState(0);
        const workerRef = useRef<Worker | null>(null);

        const startOptimization = () => {
                if (!level) return;
                setIsRunning(true);
                setProgress(0);
                
                workerRef.current = new Worker(new URL('@/lib/optimizer/worker.ts', import.meta.url));
                
                workerRef.current.onmessage = (e) => {
                        const { type, generation: gen, bestFitness, bestCandidate } = e.data;
                        
                        if (type === "progress") {
                                setGeneration(gen);
                                setProgress((gen / 100) * 100); // Assuming 100 generations
                                setBestScore(bestFitness);
                        } else if (type === "complete") {
                                setIsRunning(false);
                                onStrategyFound(bestCandidate.plan);
                                workerRef.current?.terminate();
                        }
                };

                workerRef.current.postMessage({ 
                        level, 
                        config: { 
                                populationSize: 20, 
                                generations: 100, 
                                mutationRate: 0.2, 
                                crossoverRate: 0.8, 
                                seed: 42 
                        } 
                });
        };

        const stopOptimization = () => {
                if (workerRef.current) {
                        workerRef.current.terminate();
                        setIsRunning(false);
                }
        };

        useEffect(() => {
                return () => {
                        if (workerRef.current) workerRef.current.terminate();
                };
        }, []);

        if (!level) return null;

        return (
                <Card className="bg-[#0f172a]/90 border-danger/20 w-full mb-6">
                        <Card.Header className="flex items-center justify-between border-b border-white/5 py-3 px-4">
                                <div className="flex flex-col">
                                        <Card.Title className="text-white font-bold uppercase tracking-wider">Genetic Optimizer</Card.Title>
                                        <p className="text-xs text-danger uppercase font-mono tracking-widest">Web Worker Pipeline</p>
                                </div>
                                <div className="flex gap-2">
                                        {isRunning ? (
                                                <Button variant="outline" size="sm" onPress={stopOptimization}>Halt Worker</Button>
                                        ) : (
                                                <Button variant="danger" size="sm" onPress={startOptimization}>Run Optimization (100 Gen)</Button>
                                        )}
                                </div>
                        </Card.Header>
                        <Card.Content className="p-6">
                                <div className="flex gap-12 text-sm text-white/80 uppercase tracking-widest font-mono mb-4">
                                        <div>
                                                <span className="text-white/40 block text-xs">Generation</span>
                                                <span className="text-2xl text-white font-bold">{generation} / 100</span>
                                        </div>
                                        <div>
                                                <span className="text-white/40 block text-xs">Best Fitness Score</span>
                                                <span className="text-2xl text-danger font-bold">{bestScore.toLocaleString()}</span>
                                        </div>
                                        <div>
                                                <span className="text-white/40 block text-xs">Pop Size</span>
                                                <span className="text-2xl text-white font-bold">20</span>
                                        </div>
                                </div>
                                {isRunning && (
                                        <div className="w-full h-1 bg-white/10 rounded overflow-hidden">
                                                <div className="h-full bg-danger transition-all duration-100 ease-linear" style={{ width: `${progress}%` }} />
                                        </div>
                                )}
                        </Card.Content>
                </Card>
        );
}