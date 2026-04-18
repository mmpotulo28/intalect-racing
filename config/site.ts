export type SiteConfig = typeof siteConfig;

export const siteConfig = {
	name: "Entelect Grand Prix",
	description: "Plan, optimize, and export deterministic race strategies for Entelect GP.",
	navItems: [
		{
			label: "Home",
			href: "/",
		},
		{
			label: "Simulator",
			href: "/simulator",
		},
		{
			label: "Docs",
			href: "/docs",
		},
		{
			label: "About",
			href: "/about",
		},
	],
	navMenuItems: [
		{
			label: "Simulator",
			href: "/simulator",
		},
		{
			label: "Docs",
			href: "/docs",
		},
		{
			label: "About",
			href: "/about",
		},
		{
			label: "GitHub",
			href: "https://github.com/mmpotulo28/intalect-racing",
		},
	],
	links: {
		github: "https://github.com/mmpotulo28/intalect-racing",
		twitter: "https://twitter.com/entelect",
		docs: "/docs",
		discord: "https://discord.gg/9b6yyZKmH4",
		sponsor: "https://entelect.co.za",
	},
};
