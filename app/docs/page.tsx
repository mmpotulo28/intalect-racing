import { title } from "@/components/primitives";

export default function DocsPage() {
	const sections = [
		{ name: "PRD", file: "docs/PRD.md" },
		{ name: "Project Overview", file: "docs/PROJECT_OVERVIEW.md" },
		{ name: "Technical Architecture", file: "docs/TECHNICAL_ARCHITECTURE.md" },
		{ name: "Development Plan", file: "docs/DEVELOPMENT_PLAN.md" },
		{ name: "Algorithms and Rules", file: "docs/ALGORITHMS_AND_RULES.md" },
		{ name: "Implementation Backlog", file: "docs/IMPLEMENTATION_BACKLOG.md" },
		{ name: "Test Strategy", file: "docs/TEST_STRATEGY.md" },
		{ name: "Success Checklist", file: "docs/SUCCESS_CHECKLIST.md" },
	];

	return (
		<div className='text-left'>
			<h1 className={title()}>Docs</h1>
			<p className='mt-4 text-muted'>Detailed project documentation is available in the repository root docs folder.</p>
			<ul className='mt-6 space-y-2'>
				{sections.map((section) => (
					<li key={section.file} className='rounded-lg border border-separator px-4 py-2'>
						<p className='font-semibold text-foreground'>{section.name}</p>
						<p className='text-sm text-muted'>{section.file}</p>
					</li>
				))}
			</ul>
		</div>
	);
}
