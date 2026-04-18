import { siteConfig } from "@/config/site";
import { title, subtitle } from "@/components/primitives";
import { GithubIcon } from "@/components/icons";

export default function Home() {
	return (
		<section className='relative flex flex-col items-center justify-center py-20 md:py-32 overflow-hidden'>
			{/* Background racing stripes/effects */}
			<div className='absolute inset-0 pointer-events-none z-[-1] opacity-60'>
				<div className='absolute top-1/4 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-danger/40 to-transparent transform -skew-y-12' />
				<div className='absolute top-1/3 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-danger/20 to-transparent transform -skew-y-12' />
				<div className='absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#060b19] to-transparent' />
			</div>

			<div className='inline-block max-w-4xl text-center justify-center relative'>
				<div className='mb-2 text-danger font-bold tracking-widest uppercase text-sm md:text-base'>University Cup</div>
				<h1 className='flex flex-col items-center justify-center leading-none tracking-tighter'>
					<span className={title({ size: "lg", class: "italic text-white" })}>ENTELECT</span>
					<span className={title({ size: "lg", color: "racing", class: "italic" })}>GRAND PRIX</span>
				</h1>
				<p className={subtitle({ class: "mt-6 text-white/70 max-w-2xl mx-auto uppercase tracking-wide text-sm md:text-base" })}>
					An F1 Inspired Race Simulation Problem
					<br />
					<span className='text-danger/80'>April 2026 | 1st Edition</span>
				</p>
			</div>

			<div className='flex flex-col sm:flex-row gap-4 mt-12 z-10 w-full items-center justify-center px-4'>
				<a className='w-full sm:w-auto relative group overflow-hidden px-8 py-3 bg-danger text-white hover:bg-danger/90 font-bold uppercase tracking-widest text-sm text-center border-b-4 border-black/20 transform transition-all hover:-translate-y-1' href='/simulator' rel='noopener noreferrer'>
					<span className='relative z-10'>Start Simulation</span>
					<div className='absolute inset-0 h-full w-0 bg-white/20 transition-all duration-300 ease-out group-hover:w-full' />
				</a>
				<a className='w-full sm:w-auto px-8 py-3 bg-transparent text-white/90 border border-white/20 hover:bg-white/10 hover:border-white/40 font-bold uppercase tracking-widest text-sm text-center transition-all' href='/docs' rel='noopener noreferrer'>
					Documentation
				</a>
			</div>

			<div className='grid gap-6 md:grid-cols-3 mt-24 max-w-5xl w-full px-6'>
				<div className='relative group bg-[#0f172a]/60 border border-white/5 p-6 backdrop-blur-md overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-danger/10 before:to-transparent before:opacity-0 before:transition-opacity hover:before:opacity-100'>
					<div className='absolute top-0 right-0 w-8 h-8 bg-danger/20 rounded-bl-full' />
					<h3 className='text-xl font-bold uppercase italic tracking-wide text-white mb-2'>Race Planning</h3>
					<p className='text-white/60 text-sm leading-relaxed'>Strict schema validation for advanced deterministic race simulation inputs.</p>
				</div>
				<div className='relative group bg-[#0f172a]/60 border border-white/5 p-6 backdrop-blur-md overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-danger/10 before:to-transparent before:opacity-0 before:transition-opacity hover:before:opacity-100'>
					<div className='absolute top-0 right-0 w-8 h-8 bg-danger/20 rounded-bl-full' />
					<h3 className='text-xl font-bold uppercase italic tracking-wide text-white mb-2'>Physics Engine</h3>
					<p className='text-white/60 text-sm leading-relaxed'>Calculate exact tyre degradations, drag factors, and refilling mechanics under varying weather.</p>
				</div>
				<div className='relative group bg-[#0f172a]/60 border border-white/5 p-6 backdrop-blur-md overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-danger/10 before:to-transparent before:opacity-0 before:transition-opacity hover:before:opacity-100'>
					<div className='absolute top-0 right-0 w-8 h-8 bg-danger/20 rounded-bl-full' />
					<h3 className='text-xl font-bold uppercase italic tracking-wide text-white mb-2'>Deterministic</h3>
					<p className='text-white/60 text-sm leading-relaxed'>Evaluate results in a strict loop to guarantee identical simulation segments on all exports.</p>
				</div>
			</div>
		</section>
	);
}
