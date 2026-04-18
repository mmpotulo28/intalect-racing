"use client";

import { title } from "@/components/primitives";
import { Card } from "@heroui/react";

export default function DocsPage() {
        const sections = [
                { name: "PRD", file: "docs/PRD.md", desc: "Product requirements and technical vision." },
                { name: "Project Overview", file: "docs/PROJECT_OVERVIEW.md", desc: "Strategic vision and core workspaces." },
                { name: "Technical Arch", file: "docs/TECHNICAL_ARCHITECTURE.md", desc: "Component dependencies & data flow." },
                { name: "Dev Plan", file: "docs/DEVELOPMENT_PLAN.md", desc: "Roadmap for development phases." },
                { name: "Algorithms & Rules", file: "docs/ALGORITHMS_AND_RULES.md", desc: "Core mathematical formulas." },
                { name: "Backlog", file: "docs/IMPLEMENTATION_BACKLOG.md", desc: "Pending tasks and technical debt." },
                { name: "Test Strategy", file: "docs/TEST_STRATEGY.md", desc: "Validation requirements and methodology." },
                { name: "Success Checklist", file: "docs/SUCCESS_CHECKLIST.md", desc: "Definition of done for project milestones." },
        ];

        return (
                <div className='w-full'>
                        <div className="mb-10 text-center">
                                <h1 className={title({ size: "lg", class: "italic text-white uppercase tracking-tighter" })}>Documentation</h1>
                                <p className='mt-4 text-white/60 max-w-2xl mx-auto'>Detailed project documentation is available in the repository root docs folder.</p>
                        </div>
                        
                        <div className='grid gap-6 md:grid-cols-2 max-w-5xl mx-auto'>
                                {sections.map((section) => (
                                        <Card key={section.file} className="bg-[#0f172a]/80 border-white/10 backdrop-blur-md overflow-hidden relative group">
                                                {/* Racing accent */}
                                                <div className='absolute top-0 right-0 w-8 h-8 bg-danger/20 rounded-bl-full z-0 pointer-events-none' />
                                                <div className='absolute inset-0 bg-gradient-to-r from-danger/0 to-danger/5 opacity-0 group-hover:opacity-100 transition-opacity z-0 pointer-events-none' />
                                                
                                                <Card.Header className="relative z-10 pb-0">
                                                        <Card.Title className='font-bold text-white uppercase tracking-wide'>{section.name}</Card.Title>
                                                </Card.Header>
                                                <Card.Content className="relative z-10 pt-2">
                                                        <p className='text-sm text-danger/80 mb-2 font-mono'>{section.file}</p>
                                                        <Card.Description className='text-white/60'>{section.desc}</Card.Description>
                                                </Card.Content>
                                        </Card>
                                ))}
                        </div>
                </div>
        );
}
