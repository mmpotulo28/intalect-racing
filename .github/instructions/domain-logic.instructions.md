---
applyTo:
    - "lib/simulation/**"
    - "lib/export/**"
    - "lib/validation/**"
description: Strict domain logic enforcement (no UI imports, strict determinism).
---

# Domain Logic Instructions

This specific module is responsible for the pure, uncoupled racing logic of the Entelect Grand Prix Strategy Platform.

## Core Rules

1. **No UI Imports Allowed**:

    - Do NOT import `react`, `next`, `@heroui/react`, or any other UI/view layer library inside these files.
    - All UI rendering must happen in `app/` and `components/`.
    - Business logic must remain purely computational.

2. **Strict Determinism (Math and Execution)**:

    - For tournament validation to work, every calculation and export must be identically reproducible across executions.
    - All floating-point comparisons and math operations must use strict deterministic algorithms.
    - Use the environment constants from `lib/constants/race.ts` (`ROUNDING.EPSILON`, `ROUNDING.DECIMALS`). No naked magic numbers.

3. **No Immutability Overheads Unless Necessary**:

    - Favor pure functions over object mutation inside high-latency calculation loops (like `simulateRace`), but rely on performant allocations over complex recursive spread clones if memory pressure spikes.

4. **Testing Paradigms**:
    - Any logic changed here _must_ be testable without the DOM. Rely on `TEST_STRATEGY.md` (e.g. byte-for-byte serialization tests or specific `.toStrictEqual()` tests).
