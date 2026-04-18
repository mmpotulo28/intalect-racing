"use client";

import { useMemo, useState } from "react";

import { title, subtitle } from "@/components/primitives";
import { downloadTextFile } from "@/lib/export/download";
import { deterministicJsonStringify } from "@/lib/export/deterministic-json";
import { buildStarterStrategy } from "@/lib/simulation/strategy-template";
import type { LevelConfig, ValidationIssue } from "@/lib/types/racing";
import { validateLevelConfig } from "@/lib/validation/schemas";

const SAMPLE_LEVEL_URL = "/examples/level4-sample.json";

const formatIssues = (issues: ValidationIssue[]): string[] => issues.map((issue) => `${issue.path || "root"}: ${issue.message}`);

export default function SimulatorPage() {
	const [levelInput, setLevelInput] = useState<string>("");
	const [validationIssues, setValidationIssues] = useState<string[]>([]);
	const [levelConfig, setLevelConfig] = useState<LevelConfig | null>(null);
	const [strategyOutput, setStrategyOutput] = useState<string>("");
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
			setStrategyOutput("");
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
		setStrategyOutput("");
	};

	const onValidateLevel = () => {
		try {
			const raw = JSON.parse(levelInput) as unknown;
			const validation = validateLevelConfig(raw);

			if (!validation.ok || !validation.data) {
				setValidationIssues(formatIssues(validation.issues ?? []));
				setLevelConfig(null);
				setStrategyOutput("");
				setStatusMessage("Validation failed. Fix the issues and validate again.");
				return;
			}

			setLevelConfig(validation.data);
			setValidationIssues([]);
			setStatusMessage("Level validation passed. You can now generate a starter strategy.");
		} catch (error) {
			setValidationIssues([error instanceof Error ? error.message : "Input is not valid JSON."]);
			setLevelConfig(null);
			setStrategyOutput("");
			setStatusMessage("Validation failed. Input must be valid JSON.");
		}
	};

	const onGenerateStrategy = () => {
		if (!levelConfig) {
			setStatusMessage("Validate a level first before generating strategy output.");
			return;
		}

		const starter = buildStarterStrategy(levelConfig);
		const serialized = deterministicJsonStringify(starter);

		setStrategyOutput(serialized);
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

	return (
		<section className='flex flex-col gap-6 py-8 md:py-10'>
			<div>
				<h1 className={title({ color: "blue" })}>Simulator Workspace</h1>
				<p className={subtitle()}>Upload or paste a race level, validate it with strict schema rules, then generate a deterministic starter strategy export.</p>
			</div>

			<div className='grid gap-4 lg:grid-cols-2'>
				<div className='rounded-xl border border-separator bg-surface p-4'>
					<h2 className='text-lg font-semibold text-foreground'>1) Level Input</h2>
					<p className='mt-1 text-sm text-muted'>Use file upload, raw JSON paste, or load the bundled sample level.</p>

					<div className='mt-3 flex flex-wrap gap-2'>
						<button className='button button--primary button--sm rounded-full' onClick={onLoadSample} type='button'>
							Load Sample
						</button>
						<label className='button button--tertiary button--sm rounded-full cursor-pointer'>
							Upload JSON <input accept='application/json,.json' className='hidden' onChange={(event) => void onUploadFile(event.target.files?.[0] ?? null)} type='file' />
						</label>
						<button className='button button--tertiary button--sm rounded-full' onClick={onValidateLevel} type='button'>
							Validate Level
						</button>
					</div>

					<textarea className='mt-3 min-h-64 w-full rounded-lg border border-separator bg-background px-3 py-2 font-mono text-sm text-foreground' onChange={(event) => setLevelInput(event.target.value)} placeholder='Paste level JSON here...' value={levelInput} />
				</div>

				<div className='rounded-xl border border-separator bg-surface p-4'>
					<h2 className='text-lg font-semibold text-foreground'>2) Validation + Starter Strategy</h2>
					<p className='mt-1 text-sm text-muted'>Validation issues appear below. Strategy generation is enabled once validation succeeds.</p>

					<p className='mt-3 rounded-lg bg-background px-3 py-2 text-sm text-muted'>{statusMessage}</p>

					{validationIssues.length > 0 ? (
						<ul className='mt-3 list-disc space-y-1 pl-5 text-sm text-danger'>
							{validationIssues.map((issue) => (
								<li key={issue}>{issue}</li>
							))}
						</ul>
					) : null}

					{parsedSummary ? (
						<div className='mt-3 rounded-lg border border-separator bg-background p-3 text-sm text-foreground'>
							<p className='font-semibold'>Parsed Level Summary</p>
							<p className='mt-1'>Track: {parsedSummary.trackName}</p>
							<p>Laps: {parsedSummary.laps}</p>
							<p>Segments: {parsedSummary.segments}</p>
							<p>Weather states: {parsedSummary.weatherStates}</p>
							<p>Total available tyre ids: {parsedSummary.tyreSetCount}</p>
						</div>
					) : null}

					<div className='mt-3 flex flex-wrap gap-2'>
						<button className='button button--primary button--sm rounded-full' onClick={onGenerateStrategy} type='button'>
							Generate Starter Strategy
						</button>
						<button className='button button--tertiary button--sm rounded-full' onClick={onDownloadStrategy} type='button'>
							Download TXT
						</button>
					</div>

					<textarea className='mt-3 min-h-64 w-full rounded-lg border border-separator bg-background px-3 py-2 font-mono text-sm text-foreground' placeholder='Generated strategy output appears here...' readOnly value={strategyOutput} />
				</div>
			</div>
		</section>
	);
}
