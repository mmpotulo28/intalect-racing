"use client";

import { title } from "@/components/primitives";
import { Card, Button } from "@heroui/react";

export default function PricingPage() {
	return (
		<div className='w-full max-w-4xl mx-auto py-12 text-center'>
			<div className='mb-12'>
				<h1 className={title({ size: "lg", class: "italic text-white uppercase tracking-tighter" })}>Competition Tracks</h1>
				<p className='mt-4 text-white/60 max-w-2xl mx-auto uppercase tracking-wider text-sm'>Select your entry bracket into the University Cup</p>
			</div>

			<div className='grid gap-8 md:grid-cols-2 max-w-4xl mx-auto'>
				<Card className='bg-[#0f172a]/80 border-white/10 backdrop-blur-md relative group text-left'>
					<div className='absolute top-0 left-0 w-16 h-16 bg-danger/10 rounded-br-[100px] z-0 pointer-events-none' />
					<Card.Header className='relative z-10 pb-4 border-b border-white/5 pt-6'>
						<Card.Title className='font-bold text-white text-2xl uppercase tracking-wide'>Student League</Card.Title>
						<Card.Description className='text-danger text-sm tracking-wider uppercase font-mono mt-1'>Free Entry</Card.Description>
					</Card.Header>
					<Card.Content className='relative z-10 pt-6'>
						<ul className='space-y-3 mb-8 text-white/70 text-sm'>
							<li className='flex items-center'>
								<span className='text-danger mr-2'>✓</span> Standard tyre models
							</li>
							<li className='flex items-center'>
								<span className='text-danger mr-2'>✓</span> Basic weather APIs
							</li>
							<li className='flex items-center'>
								<span className='text-danger mr-2'>✓</span> 10 Simulation Credits/day
							</li>
						</ul>
						<Button variant='danger' className='w-full uppercase font-bold tracking-widest text-white border-b-4 border-black/20 hover:-translate-y-1 transition-transform'>
							Register Team
						</Button>
					</Card.Content>
				</Card>

				<Card className='bg-[#0f172a]/80 border-danger/60 backdrop-blur-md relative group text-left transform scale-105 shadow-2xl shadow-danger/20'>
					<div className='absolute top-0 right-0 w-24 h-24 bg-danger/20 rounded-bl-[150px] z-0 pointer-events-none' />
					<div className='absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-danger text-white text-xs font-bold px-4 py-1 uppercase tracking-widest rounded-t-sm z-20'>Professional</div>
					<Card.Header className='relative z-10 pb-4 border-b border-white/10 pt-6 flex flex-col items-start bg-danger/5'>
						<Card.Title className='font-bold text-white text-2xl uppercase tracking-wide'>Pro Series</Card.Title>
						<Card.Description className='text-danger text-sm tracking-wider uppercase font-mono mt-1'>Entelect Employees</Card.Description>
					</Card.Header>
					<Card.Content className='relative z-10 pt-6 bg-[#0f172a]/95'>
						<ul className='space-y-3 mb-8 text-white/70 text-sm'>
							<li className='flex items-center'>
								<span className='text-danger mr-2'>✓</span> Advanced compound modeling
							</li>
							<li className='flex items-center'>
								<span className='text-danger mr-2'>✓</span> Dynamic weather & safety cars
							</li>
							<li className='flex items-center'>
								<span className='text-danger mr-2'>✓</span> Unlimited Simulation Quota
							</li>
						</ul>
						<Button variant='danger' className='w-full justify-center uppercase font-bold tracking-widest text-white hover:bg-danger/90 transition-transform'>
							Initialize Dashboard
						</Button>
					</Card.Content>
				</Card>
			</div>
		</div>
	);
}
