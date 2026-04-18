"use client";

import { useState } from "react";
import { Button, Kbd, Link, TextField, InputGroup } from "@heroui/react";
import NextLink from "next/link";
import clsx from "clsx";

import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import { TwitterIcon, GithubIcon, SearchIcon } from "@/components/icons";

const FlagIcon = () => (
	<svg width='24' height='24' viewBox='0 0 24 24' fill='currentColor'>
		<path d='M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z' />
	</svg>
);

export const Navbar = () => {
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	const getMobileMenuItemClass = (index: number) => {
		if (index === 2) {
			return "text-danger"; // Make simulator red in mobile
		}

		if (index === siteConfig.navMenuItems.length - 1) {
			return "text-danger";
		}

		return "text-foreground";
	};

	const searchInput = (
		<TextField aria-label='Search' type='search'>
			<InputGroup>
				<InputGroup.Prefix>
					<SearchIcon className='text-base text-muted pointer-events-none flex-shrink-0' />
				</InputGroup.Prefix>
				<InputGroup.Input className='text-sm' placeholder='Search...' />
				<InputGroup.Suffix>
					<Kbd className='hidden lg:inline-flex'>
						<Kbd.Abbr keyValue='command' />
						<Kbd.Content>K</Kbd.Content>
					</Kbd>
				</InputGroup.Suffix>
			</InputGroup>
		</TextField>
	);

	return (
		<nav className='sticky top-0 z-40 w-full border-b border-danger/20 bg-[#060b19]/80 backdrop-blur-xl'>
			<header className='mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-4 px-6 relative'>
				{/* Top red accent line */}
				<div className='absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-danger to-transparent opacity-50'></div>

				<div className='flex items-center gap-4'>
					<NextLink className='flex items-center gap-2' href='/'>
						<div className='text-danger flex items-center justify-center p-1 bg-danger/10 rounded-lg'>
							<FlagIcon />
						</div>
						<div className='flex flex-col'>
							<p className='font-bold text-inherit leading-none tracking-tight text-white uppercase italic'>
								ENTELECT <span className='text-danger'>GP</span>
							</p>
							<span className='text-[10px] text-muted tracking-widest uppercase leading-none mt-[2px]'>Strategy Platform</span>
						</div>
					</NextLink>
					<ul className='hidden lg:flex gap-6 ml-6'>
						{siteConfig.navItems.map((item) => (
							<li key={item.href} className='relative group'>
								<NextLink className={clsx("text-sm uppercase tracking-wider font-semibold transition-colors py-2", "text-white/70 hover:text-white", "data-[active=true]:text-danger")} href={item.href}>
									{item.label}
								</NextLink>
								<div className='absolute -bottom-[20px] left-0 right-0 h-[3px] bg-danger scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-t-sm' />
							</li>
						))}
					</ul>
				</div>

				<div className='hidden sm:flex items-center gap-2'>
					<Link aria-label='Github' href={siteConfig.links.github} rel='noopener noreferrer' target='_blank'>
						<GithubIcon className='text-muted hover:text-white transition-colors' />
					</Link>
					<ThemeSwitch />
					<div className='hidden lg:flex ml-2'>{searchInput}</div>
					<div className='hidden md:flex ml-2'>
						<NextLink href='/simulator'>
							<Button className='text-sm font-bold uppercase tracking-wider bg-danger text-white hover:bg-danger/80 border-none' variant='flat' radius='sm'>
								Launch Simulator
							</Button>
						</NextLink>
					</div>
				</div>

				<div className='flex sm:hidden items-center gap-2'>
					<Link aria-label='Github' href={siteConfig.links.github} rel='noopener noreferrer' target='_blank'>
						<GithubIcon className='text-muted' />
					</Link>
					<ThemeSwitch />
					<button aria-expanded={isMenuOpen} aria-label='Toggle menu' className='p-2 text-white' onClick={() => setIsMenuOpen(!isMenuOpen)}>
						<svg className='h-6 w-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
							{isMenuOpen ? <path d='M6 18L18 6M6 6l12 12' strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} /> : <path d='M4 6h16M4 12h16M4 18h16' strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} />}
						</svg>
					</button>
				</div>
			</header>

			{isMenuOpen && (
				<div className='border-t border-danger/20 bg-[#060b19]/95 sm:hidden backdrop-blur-xl'>
					<div className='p-4'>{searchInput}</div>
					<ul className='flex flex-col gap-2 px-4 pb-4'>
						{siteConfig.navMenuItems.map((item, index) => (
							<li key={`${item.label}-${index}`}>
								<Link className={clsx("block py-3 text-sm font-bold uppercase tracking-wider no-underline", getMobileMenuItemClass(index))} href={item.href}>
									{item.label}
								</Link>
							</li>
						))}
					</ul>
				</div>
			)}
		</nav>
	);
};
