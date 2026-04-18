import { siteConfig } from "@/config/site";
import { title, subtitle } from "@/components/primitives";
import { GithubIcon } from "@/components/icons";

export default function Home() {
	return (
		<section className='flex flex-col items-center justify-center gap-4 py-8 md:py-10'>
			<div className='inline-block max-w-xl text-center justify-center'>
				<span className={title()}>Entelect&nbsp;</span>
				<span className={title({ color: "blue" })}>Grand Prix&nbsp;</span>
				<br />
				<span className={title()}>Strategy Platform</span>
				<div className={subtitle({ class: "mt-4" })}>Deterministic race planning, optimization, and export for Levels 1-4.</div>
			</div>

			<div className='flex gap-3'>
				<a className='button button--primary button--md rounded-full' href='/simulator' rel='noopener noreferrer'>
					Open Simulator
				</a>
				<a className='button button--tertiary button--md rounded-full' href='/docs' rel='noopener noreferrer'>
					Documentation
				</a>
				<a className='button button--tertiary button--md rounded-full' href={siteConfig.links.github} rel='noopener noreferrer' target='_blank'>
					<GithubIcon size={20} />
					GitHub
				</a>
			</div>

			<div className='mt-8'>
				<div className='flex items-center gap-2 rounded-xl bg-surface shadow-surface px-4 py-2'>
					<pre className='text-sm font-medium font-mono'>Phase 1 implementation complete: domain types, schemas, parsers, deterministic export. Next up: simulation engine.</pre>
				</div>
			</div>

			<div className='w-full max-w-3xl grid gap-3 md:grid-cols-3 mt-4'>
				<div className='rounded-xl border border-separator bg-surface px-4 py-3'>
					<p className='text-sm font-semibold text-foreground'>Input + Validation</p>
					<p className='text-sm text-muted mt-1'>Strict schema and semantic validation for level and strategy payloads.</p>
				</div>
				<div className='rounded-xl border border-separator bg-surface px-4 py-3'>
					<p className='text-sm font-semibold text-foreground'>Deterministic Core</p>
					<p className='text-sm text-muted mt-1'>Stable normalization and deterministic serialization to keep submissions reproducible.</p>
				</div>
				<div className='rounded-xl border border-separator bg-surface px-4 py-3'>
					<p className='text-sm font-semibold text-foreground'>Simulation Next</p>
					<p className='text-sm text-muted mt-1'>Segment physics, weather timeline, tyres, fuel, pit stops, and score breakdown pipeline.</p>
				</div>
			</div>

			<div className='mt-2'>
				<div className='flex items-center gap-2 rounded-xl bg-surface shadow-surface px-4 py-2'>
					<pre className='text-sm font-medium font-mono'>
						Start by exploring <code className='px-2 py-1 h-fit font-mono font-normal inline whitespace-nowrap rounded-sm bg-accent/20 text-accent text-sm'>app/simulator/page.tsx</code>
					</pre>
				</div>
			</div>
		</section>
	);
}
