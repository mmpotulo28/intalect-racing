# Project Guidelines

## Code Style

- Use **Next.js 15 (App Router)** and **React 19**.
- Use **TypeScript** strictly. All types and interfaces go in `lib/types/` or `types/`.
- Rely on **Zod** (`lib/validation/`) for all strict schema validations.
- Keep domain logic pure and uncoupled from the UI. Place it in `lib/` (`lib/simulation/`, `lib/export/`, etc.).

## HeroUI v3 & Design Principles

- **Avoid Redundancy:** Use HeroUI v3 components (e.g., `<Button>`, `<Tabs>`) instead of native HTML equivalents or building custom components that duplicate HeroUI functionality.
- **Semantic Intent Over Visual Style:** Use semantic naming (`variant="primary"`, `"secondary"`, `"tertiary"`, `"danger"`) instead of visual descriptions (`solid`, `flat`, `bordered`).
- **Composition Over Configuration:** Use HeroUI's compound components (e.g., `<Accordion><AccordionItem><AccordionHeading>...`) via dot notation or named exports.
- **Predictable Behavior:** Rely on standard sizes (`sm`, `md`, `lg`) and semantic variants.
- **Styles & Tailwind v4:** Configuration is fully defined centrally via CSS (`styles/globals.css`) utilizing the new `@theme` directives and PostCSS (`@tailwindcss/postcss`). Use `@heroui/styles` for styling. Customize theme colors using `oklch` syntax in `globals.css` (e.g., custom Midnight Blue/Racing Red themes).

## Architecture

- **Frameworks:** Next.js 15.5.9 (App Router) and React 19.
- **`app/`**: Next.js routing and layout components.
- **`components/`**: Reusable primitive and shared UI components relying on HeroUI where possible.
- **`lib/`**: Domain logic uncoupled from the UI. Partitioned into `constants/`, `validation/`, `parser/`, `simulation/` (core engine), and `export/`.

## Simulation & Deterministic Engine Conventions

- **Strict Determinism:** Determinism is the core technical requirement for valid competition validation. Code must always execute identically.
- **Simulation Math:** Float calculations (`lib/simulation/engine.ts`) rely strictly on deterministic algorithms governed by constants (`ROUNDING.EPSILON`, `ROUNDING.DECIMALS`).
- **Export Serialization:** JSON artifacts are processed strictly through custom sorting functions (`lib/export/deterministic-json.ts` -> `deterministicJsonStringify`) to ensure stable key ordering byte-for-byte.

## Build and Test

- **Package Manager**: Use `pnpm`.
- **Run dev**: `pnpm dev` (runs Next.js with Turbopack).
- **Run build**: `pnpm build`.
- **Lint**: `pnpm lint`.
- **Type Checking**: `pnpm tsc --noEmit`.
- **Testing**: Wait for exact byte-for-byte state comparisons using Vitest/Jest (Reference `TEST_STRATEGY.md`).

## Reference Documentation (Link, don't embed)

For detailed requirements and formulas, refer to the following documentation files rather than making assumptions:

- **`docs/PROJECT_OVERVIEW.md`**: Strategic vision and core workspaces.
- **`docs/ALGORITHMS_AND_RULES.md`**: Core mathematical formulas for kinematics, weather/friction multipliers, tyre degradation rates, fuel consumption, and state transitions.
- **`docs/TECHNICAL_ARCHITECTURE.md` & `docs/PRD.md`**: Component dependencies, input-to-output pipelines.
- **`docs/TEST_STRATEGY.md`**: Testing methodology and validation requirements.
