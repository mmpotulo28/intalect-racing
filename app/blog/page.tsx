"use client";

import { title } from "@/components/primitives";
import { Card } from "@heroui/react";

export default function BlogPage() {
	return (
		<div className='w-full max-w-5xl mx-auto py-12'>
			<div className='mb-10 text-center'>
				<h1 className={title({ size: "lg", class: "italic text-white uppercase tracking-tighter" })}>News & Updates</h1>
			</div>

			<div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
				<Card className='bg-[#0f172a]/80 border-white/10 backdrop-blur-md relative group'>
					<div className='absolute inset-0 bg-gradient-to-r from-danger/0 to-danger/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none' />
					<Card.Header className='relative z-10 pb-2 border-b border-white/5'>
						<Card.Title className='font-bold text-white uppercase tracking-wide pt-4'>Platform V1.0 Alpha</Card.Title>
						<Card.Description className='text-danger text-xs tracking-wider uppercase font-mono'>18 Apr 2026</Card.Description>
					</Card.Header>
					<Card.Content className='relative z-10 pt-4'>
						<p className='text-white/60 text-sm leading-relaxed'>Initial tournament evaluation platform goes live. Deterministic physics models have passed Phase 1 simulation validation.</p>
					</Card.Content>
				</Card>

				<Card className='bg-[#0f172a]/80 border-white/10 backdrop-blur-md relative group'>
					<div className='absolute inset-0 bg-gradient-to-r from-danger/0 to-danger/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none' />
					<Card.Header className='relative z-10 pb-2 border-b border-white/5'>
						<Card.Title className='font-bold text-white uppercase tracking-wide pt-4'>Tournament Rules</Card.Title>
						<Card.Description className='text-danger text-xs tracking-wider uppercase font-mono'>12 Apr 2026</Card.Description>
					</Card.Header>
					<Card.Content className='relative z-10 pt-4'>
						<p className='text-white/60 text-sm leading-relaxed'>Guidelines updated regarding API latency bounds and the maximum tyre degradation coefficients acceptable in a single stint.</p>
					</Card.Content>
				</Card>
			</div>
		</div>
	);
}
