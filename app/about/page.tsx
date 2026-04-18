"use client";

import { title } from "@/components/primitives";
import { Card } from "@heroui/react";

export default function AboutPage() {
	return (
		<div className='w-full max-w-4xl mx-auto py-12'>
			<div className='mb-10 text-center'>
				<h1 className={title({ size: "lg", class: "italic text-white uppercase tracking-tighter" })}>About the Project</h1>
				<p className='mt-4 text-white/60 max-w-2xl mx-auto uppercase tracking-wider text-sm'>Entelect Grand Prix 2026</p>
			</div>

			<Card className='bg-[#0f172a]/80 border-white/10 backdrop-blur-md overflow-hidden relative'>
				<div className='absolute top-0 right-0 w-16 h-16 bg-danger/20 rounded-bl-[100px] z-0 pointer-events-none' />
				<Card.Header className='relative z-10 pb-0 border-b border-white/5'>
					<Card.Title className='font-bold text-white uppercase tracking-wide text-2xl pt-4'>University Cup</Card.Title>
				</Card.Header>
				<Card.Content className='relative z-10 pt-6'>
					<p className='text-white/80 leading-relaxed mb-6'>The Entelect Grand Prix Strategy Platform is an advanced Formula 1 simulation ecosystem. It evaluates race strategies, deterministic physics elements (tier degradation, aerodynamic drag, weather effects), and telemetry visualization.</p>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						<div className='p-4 bg-black/40 rounded-lg border border-danger/10'>
							<h3 className='text-danger font-bold uppercase tracking-wider mb-2 text-sm'>Target Scope</h3>
							<p className='text-muted text-sm leading-relaxed'>Built for strict deterministic calculations that ensure byte-for-byte matching tournament outputs to ensure fair competitive coding validation.</p>
						</div>
						<div className='p-4 bg-black/40 rounded-lg border border-danger/10'>
							<h3 className='text-danger font-bold uppercase tracking-wider mb-2 text-sm'>Simulation Engine</h3>
							<p className='text-muted text-sm leading-relaxed'>Employs integer precision and custom stringification to bypass JavaScript float instability, delivering flawless deterministic replays.</p>
						</div>
					</div>
				</Card.Content>
			</Card>
		</div>
	);
}
