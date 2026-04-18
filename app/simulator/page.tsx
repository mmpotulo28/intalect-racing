"use client";

import { useMemo, useState } from "react";

import { title, subtitle } from "@/components/primitives";
import { downloadTextFile } from "@/lib/export/download";
import { deterministicJsonStringify } from "@/lib/export/deterministic-json";
import { simulateRace } from "@/lib/simulation/engine";
import { buildStarterStrategy } from "@/lib/simulation/strategy-template";
import type { LevelConfig, SimulationResult, StrategyPlan, ValidationIssue } from "@/lib/types/racing";
import { validateLevelConfig, validateStrategyPlan } from "@/lib/validation/schemas";
import { TelemetryMap } from "@/components/simulator/map";
import { OptimizerDashboard } from "@/components/simulator/optimizer";

const SAMPLE_LEVEL_URL = "/examples/level4-sample.json";

const formatIssues = (issues: ValidationIssue[]): string[] => issues.map((issue) => `${issue.path || "root"}: ${issue.message}`);

export default function SimulatorPage() {
	const [levelInput, setLevelInput] = useState<string>("");
	const [validationIssues, setValidationIssues] = useState<string[]>([]);
	const [levelConfig, setLevelConfig] = useState<LevelConfig | null>(null);
	const [strategyPlan, setStrategyPlan] = useState<StrategyPlan | null>(null);
	const [strategyOutput, setStrategyOutput] = useState<string>("");
	const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
	const [statusMessage, setStatusMessage] = useState<string>("Paste JSON, upload a file, or load the sample level to start.");

	const parsedSummary = useMemo(() => {
		if (!levelConfig) {
			return null;
		}

		return {
			trackName: levelConfig.track.name,
			laps: levelConfig.race.laps,
			segments: levelConfig.track.segments.length,
			weatherStates: levelConfig.weather.conditions.length,
			tyreSetCount: levelConfig.tyres.available_sets.reduce((total, set) => total + set.ids.length, 0),
		};
	}, [levelConfig]);

	const onLoadSample = async () => {
		try {
			const response = await fetch(SAMPLE_LEVEL_URL);

			if (!response.ok) {
				throw new Error(`Sample load failed with status ${response.status}.`);
			}

			const sampleText = await response.text();
			setLevelInput(sampleText);
			setStatusMessage("Sample level loaded. Click Validate Level to continue.");
			setValidationIssues([]);
			setLevelConfig(null);
			setStrategyPlan(null);
			setStrategyOutput("");
			setSimulationResult(null);
		} catch (error) {
			setStatusMessage(error instanceof Error ? error.message : "Failed to load sample level.");
		}
	};

	const onUploadFile = async (file: File | null) => {
		if (!file) {
			return;
		}

		const text = await file.text();

		setLevelInput(text);
		setStatusMessage(`Loaded ${file.name}. Click Validate Level to continue.`);
		setValidationIssues([]);
		setLevelConfig(null);
		setStrategyPlan(null);
		setStrategyOutput("");
		setSimulationResult(null);
	};

	const onValidateLevel = () => {
		try {
			const raw = JSON.parse(levelInput) as unknown;
			const validation = validateLevelConfig(raw);

			if (!validation.ok || !validation.data) {
				setValidationIssues(formatIssues(validation.issues ?? []));
				setLevelConfig(null);
				setStrategyPlan(null);
				setStrategyOutput("");
				setSimulationResult(null);
				setStatusMessage("Validation failed. Fix the issues and validate again.");
				return;
			}

			setLevelConfig(validation.data);
			setValidationIssues([]);
			setSimulationResult(null);
			setStatusMessage("Level validation passed. You can now generate a starter strategy.");
		} catch (error) {
			setValidationIssues([error instanceof Error ? error.message : "Input is not valid JSON."]);
			setLevelConfig(null);
			setStrategyPlan(null);
			setStrategyOutput("");
			setSimulationResult(null);
			setStatusMessage("Validation failed. Input must be valid JSON.");
		}
	};

	const onGenerateStrategy = () => {
		if (!levelConfig) {
			setStatusMessage("Validate a level first before generating strategy output.");
			return;
		}

		const starter = buildStarterStrategy(levelConfig);
		const strategyValidation = validateStrategyPlan(starter);

		if (!strategyValidation.ok || !strategyValidation.data) {
			setStatusMessage("Generated strategy failed schema validation.");
			setValidationIssues(formatIssues(strategyValidation.issues ?? []));
			return;
		}

		const serialized = deterministicJsonStringify(starter);

		setStrategyPlan(starter);
		setStrategyOutput(serialized);
		setSimulationResult(null);
		setStatusMessage("Starter strategy generated. Download when ready.");
	};

	const onDownloadStrategy = () => {
		if (!strategyOutput) {
			setStatusMessage("Generate a strategy before downloading.");
			return;
		}

		downloadTextFile("strategy-output.txt", strategyOutput, "text/plain");
		setStatusMessage("Downloaded strategy-output.txt");
	};

	const onDownloadStrategyJson = () => {
		if (!strategyOutput) {
			setStatusMessage("Generate a strategy before downloading.");
			return;
		}

		downloadTextFile("strategy-output.json", strategyOutput, "application/json");
		setStatusMessage("Downloaded strategy-output.json");
	};

	const onRunSimulation = () => {
		if (!levelConfig || !strategyPlan) {
			setStatusMessage("Validate a level and generate a strategy before running simulation.");
			return;
		}

		try {
			const result = simulateRace(levelConfig, strategyPlan);
			setSimulationResult(result);
			setStatusMessage("Simulation completed. Review race metrics below.");
		} catch (error) {
			setStatusMessage(error instanceof Error ? error.message : "Simulation failed.");
		}
	};

	return (
		<section className='flex flex-col gap-6 py-8 md:py-10 max-w-6xl mx-auto'>
			<div className='mb-4'>
				<div className='inline-block px-3 py-1 bg-danger/10 text-danger text-xs font-bold uppercase tracking-widest rounded-full mb-3'>Simulation Environment</div>
				<h1 className={title({ size: "lg", class: "block italic tracking-tight" })}>
					RACE <span className='text-danger'>COMMAND</span>
				</h1>
				<p className={subtitle({ class: "mt-4 max-w-2xl" })}>Upload or paste a race level, validate it with strict schema rules, then generate a deterministic starter strategy export.</p>
			</div>

			<div className='grid gap-6 lg:grid-cols-2'>
				<div className='rounded-2xl border border-white/10 bg-[#0a0f1c]/80 backdrop-blur-xl shadow-2xl p-6'>
					<h2 className='text-lg font-bold italic uppercase tracking-wider text-white flex items-center gap-2'>
						<span className='w-2 h-6 bg-danger rounded-sm'></span>
						1. Level Data
					</h2>
					<p className='mt-2 text-sm text-white/50'>Use file upload, raw JSON paste, or load the bundled sample level.</p>

					<div className='mt-5 flex flex-wrap gap-3'>
						<button className='px-4 py-2 bg-danger text-white text-xs font-bold uppercase tracking-wider rounded-md hover:bg-danger/80 transition-colors' onClick={onLoadSample} type='button'>
							Load Sample
						</button>
						<label className='px-4 py-2 bg-white/5 text-white/90 text-xs font-bold uppercase tracking-wider rounded-md hover:bg-white/10 transition-colors cursor-pointer border border-white/10'>
							Upload JSON <input accept='application/json,.json' className='hidden' onChange={(event) => void onUploadFile(event.target.files?.[0] ?? null)} type='file' />
						</label>
						<button className='px-4 py-2 bg-white/5 text-white/90 text-xs font-bold uppercase tracking-wider rounded-md hover:bg-white/10 transition-colors border border-white/10' onClick={onValidateLevel} type='button'>
							Validate Level
						</button>
					</div>

					<textarea className='mt-5 min-h-[320px] w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 font-mono text-[13px] text-white/80 focus:border-danger/50 focus:ring-1 focus:ring-danger/50 transition-all resize-y' onChange={(event) => setLevelInput(event.target.value)} placeholder='Paste level JSON here...' value={levelInput} />
				</div>

				<div className='rounded-2xl border border-white/10 bg-[#0a0f1c]/80 backdrop-blur-xl shadow-2xl p-6'>
					<h2 className='text-lg font-bold italic uppercase tracking-wider text-white flex items-center gap-2'>
						<span className='w-2 h-6 bg-danger rounded-sm'></span>
						2. Strategy Engine
					</h2>
					<p className='mt-2 text-sm text-white/50'>Validation issues appear below. Strategy generation and simulation are enabled once validation succeeds.</p>

					<div className='mt-4 rounded-lg bg-danger/10 border border-danger/20 px-4 py-3 text-sm text-danger/90 font-medium'>{statusMessage}</div>

					{validationIssues.length > 0 ? (
						<ul className='mt-4 list-disc space-y-1 pl-5 text-sm text-danger bg-danger/5 p-4 rounded-lg border border-danger/20'>
							{validationIssues.map((issue) => (
								<li key={issue}>{issue}</li>
							))}
						</ul>
					) : null}

					{parsedSummary ? (
						<div className='mt-4 flex flex-wrap gap-2 text-xs'>
							<div className='bg-white/5 border border-white/10 rounded-md px-3 py-2 flex flex-col'>
								<span className='text-white/40 uppercase tracking-wider mb-1'>Track</span>
								<span className='text-white font-medium'>{parsedSummary.trackName}</span>
							</div>
							<div className='bg-white/5 border border-white/10 rounded-md px-3 py-2 flex flex-col'>
								<span className='text-white/40 uppercase tracking-wider mb-1'>Laps</span>
								<span className='text-white font-medium'>{parsedSummary.laps}</span>
							</div>
							<div className='bg-white/5 border border-white/10 rounded-md px-3 py-2 flex flex-col'>
								<span className='text-white/40 uppercase tracking-wider mb-1'>Segments</span>
								<span className='text-white font-medium'>{parsedSummary.segments}</span>
							</div>
							<div className='bg-white/5 border border-white/10 rounded-md px-3 py-2 flex flex-col'>
								<span className='text-white/40 uppercase tracking-wider mb-1'>Weather</span>
								<span className='text-white font-medium'>{parsedSummary.weatherStates}</span>
							</div>
							<div className='bg-white/5 border border-white/10 rounded-md px-3 py-2 flex flex-col'>
								<span className='text-white/40 uppercase tracking-wider mb-1'>Tyres</span>
								<span className='text-white font-medium'>{parsedSummary.tyreSetCount}</span>
							</div>
						</div>
					) : null}

					<div className='mt-5 flex flex-wrap gap-3'>
						<OptimizerDashboard 
							level={levelConfig} 
							onStrategyFound={(plan) => {
								setStrategyPlan(plan);
								setStrategyOutput(deterministicJsonStringify(plan));
								setStatusMessage("Optimized strategy generated automatically.");
							}} 
						/>
						
						<button className='px-4 py-2 bg-danger text-white text-xs font-bold uppercase tracking-wider rounded-md hover:bg-danger/80 transition-colors' onClick={onGenerateStrategy} type='button'>
							Generate Target Strategy
						</button>
						<button className='px-4 py-2 bg-white text-black text-xs font-bold uppercase tracking-wider rounded-md hover:bg-white/80 transition-colors' onClick={onRunSimulation} type='button'>
							Run Simulation
						</button>
						<button className='px-3 py-2 bg-transparent text-white/70 hover:text-white text-xs font-bold uppercase tracking-wider rounded-md hover:bg-white/10 transition-colors border border-transparent hover:border-white/10' onClick={onDownloadStrategy} type='button'>
							TXT
						</button>
						<button className='px-3 py-2 bg-transparent text-white/70 hover:text-white text-xs font-bold uppercase tracking-wider rounded-md hover:bg-white/10 transition-colors border border-transparent hover:border-white/10' onClick={onDownloadStrategyJson} type='button'>
							JSON
						</button>
					</div>

					<textarea className='mt-5 min-h-[160px] w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 font-mono text-[13px] text-white/60 focus:border-danger/50 focus:ring-1 focus:ring-danger/50 transition-all resize-y' placeholder='Generated strategy output appears here...' readOnly value={strategyOutput} />
				</div>
			</div>

			{simulationResult ? (
				<div className='rounded-2xl border border-white/10 bg-[#0a0f1c]/80 backdrop-blur-xl shadow-2xl p-6 mt-4'>
					<h2 className='text-lg font-bold italic uppercase tracking-wider text-white flex items-center gap-2 mb-6'>
						<span className='w-2 h-6 bg-danger rounded-sm' />
						3. Telemetry Results
					</h2>
					<TelemetryMap segments={levelConfig?.track.segments || []} result={simulationResult} isActive={true} />
					<div className='grid gap-4 sm:grid-cols-2 md:grid-cols-4 mt-6'>
						<div className='rounded-xl bg-black/40 border border-white/5 p-4 flex flex-col justify-between'>
							<div className='flex items-center gap-2 mb-2'>
								<div className='w-2 h-2 rounded-full bg-blue-500'></div>
								<p className='text-[10px] uppercase font-bold tracking-widest text-white/50'>Total Time</p>
							</div>
							<p className='text-2xl font-mono text-white/90'>
								{simulationResult.total_time_s.toFixed(2)}
								<span className='text-sm text-white/40 ml-1'>s</span>
							</p>
						</div>
						<div className='rounded-xl bg-black/40 border border-white/5 p-4 flex flex-col justify-between'>
							<div className='flex items-center gap-2 mb-2'>
								<div className='w-2 h-2 rounded-full bg-yellow-500'></div>
								<p className='text-[10px] uppercase font-bold tracking-widest text-white/50'>Fuel Used</p>
							</div>
							<p className='text-2xl font-mono text-white/90'>
								{simulationResult.fuel_used_l.toFixed(2)}
								<span className='text-sm text-white/40 ml-1'>L</span>
							</p>
						</div>
						<div className='rounded-xl bg-black/40 border border-white/5 p-4 flex flex-col justify-between'>
							<div className='flex items-center gap-2 mb-2'>
								<div className='w-2 h-2 rounded-full bg-green-500'></div>
								<p className='text-[10px] uppercase font-bold tracking-widest text-white/50'>Fuel Remaining</p>
							</div>
							<p className='text-2xl font-mono text-white/90'>
								{simulationResult.fuel_remaining_l.toFixed(2)}
								<span className='text-sm text-white/40 ml-1'>L</span>
							</p>
						</div>
						<div className='rounded-xl bg-black/40 border border-white/5 p-4 flex flex-col justify-between'>
							<div className='flex items-center gap-2 mb-2'>
								<div className='w-2 h-2 rounded-full bg-orange-500'></div>
								<p className='text-[10px] uppercase font-bold tracking-widest text-white/50'>Deagradation</p>
							</div>
							<p className='text-2xl font-mono text-white/90'>{simulationResult.total_tyre_degradation.toFixed(3)}</p>
						</div>
						<div className='rounded-xl bg-black/40 border border-white/5 p-4 flex flex-col justify-between'>
							<div className='flex items-center gap-2 mb-2'>
								<div className='w-2 h-2 rounded-full bg-danger'></div>
								<p className='text-[10px] uppercase font-bold tracking-widest text-white/50'>Crashes</p>
							</div>
							<p className='text-2xl font-mono text-white/90'>{simulationResult.crashes}</p>
						</div>
						<div className='rounded-xl bg-black/40 border border-white/5 p-4 flex flex-col justify-between'>
							<div className='flex items-center gap-2 mb-2'>
								<div className='w-2 h-2 rounded-full bg-danger'></div>
								<p className='text-[10px] uppercase font-bold tracking-widest text-white/50'>Blowouts</p>
							</div>
							<p className='text-2xl font-mono text-white/90'>{simulationResult.blowouts}</p>
						</div>
						<div className='rounded-xl bg-black/40 border border-white/5 p-4 flex flex-col justify-between'>
							<div className='flex items-center gap-2 mb-2'>
								<div className='w-2 h-2 rounded-full bg-purple-500'></div>
								<p className='text-[10px] uppercase font-bold tracking-widest text-white/50'>Base Score</p>
							</div>
							<p className='text-2xl font-mono text-white/90'>{simulationResult.score.base_score.toFixed(2)}</p>
						</div>
						<div className='rounded-xl bg-gradient-to-br from-danger/20 to-black/40 border border-danger/30 p-4 flex flex-col justify-between relative overflow-hidden'>
							<div className='absolute -right-4 -bottom-4 text-danger/10 text-6xl italic font-black'>GP</div>
							<div className='flex items-center gap-2 mb-2 relative z-10'>
								<div className='w-2 h-2 rounded-full bg-danger animate-pulse'></div>
								<p className='text-[10px] uppercase font-bold tracking-widest text-danger'>Final Score</p>
							</div>
							<p className='text-3xl font-mono text-white font-bold relative z-10 shadow-sm'>{simulationResult.score.final_score.toFixed(2)}</p>
						</div>
					</div>

					{simulationResult.warnings.length > 0 ? (
						<div className='mt-6 rounded-xl border border-warning/40 bg-warning/10 p-4'>
							<p className='text-xs font-bold uppercase tracking-wider text-warning flex items-center gap-2'>
								<span className='w-2 h-2 rounded-full bg-warning'></span>
								Telemetry Warnings
							</p>
							<ul className='mt-3 list-disc space-y-1 pl-5 text-sm text-warning/90'>
								{simulationResult.warnings.slice(0, 8).map((warning) => (
									<li key={warning}>{warning}</li>
								))}
							</ul>
						</div>
					) : null}

					<div className='mt-6 overflow-x-auto rounded-xl border border-white/5 bg-black/40'>
						<table className='w-full min-w-[760px] text-left text-sm whitespace-nowrap'>
							<thead className='bg-white/5 border-b border-white/10'>
								<tr>
									<th className='px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-white/50'>Lap</th>
									<th className='px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-white/50'>Segment</th>
									<th className='px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-white/50'>Type</th>
									<th className='px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-white/50'>Weather</th>
									<th className='px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-white/50'>Entry V</th>
									<th className='px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-white/50'>Exit V</th>
									<th className='px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-white/50'>Segment Time</th>
									<th className='px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-white/50'>Fuel Left</th>
									<th className='px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-white/50'>Crash</th>
								</tr>
							</thead>
							<tbody className='divide-y divide-white/5 text-white/70'>
								{simulationResult.segments.slice(0, 20).map((row) => (
									<tr className='hover:bg-white/5 transition-colors' key={`${row.lap}-${row.segment_id}`}>
										<td className='px-4 py-2 font-mono'>{row.lap}</td>
										<td className='px-4 py-2 font-mono'>{row.segment_id}</td>
										<td className='px-4 py-2'>{row.segment_type}</td>
										<td className='px-4 py-2'>{row.weather}</td>
										<td className='px-4 py-2 font-mono'>{row.entry_speed_mps.toFixed(2)}</td>
										<td className='px-4 py-2 font-mono'>{row.exit_speed_mps.toFixed(2)}</td>
										<td className='px-4 py-2 font-mono'>{row.segment_time_s.toFixed(2)}s</td>
										<td className='px-4 py-2 font-mono'>{row.fuel_after_l.toFixed(3)}L</td>
										<td className='px-4 py-2'>{row.crashed ? <span className='text-danger font-bold'>YES</span> : "No"}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			) : null}
		</section>
	);
}
