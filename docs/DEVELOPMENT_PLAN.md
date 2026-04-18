# Development Plan

## Delivery Approach

Use a domain-first implementation sequence:

1. Build and verify simulation correctness.
2. Add deterministic optimization.
3. Integrate HeroUI workflows.
4. Complete testing and release hardening.

## Phase 0: Project Setup and Standards

1. Finalize coding conventions and folder structure.
2. Add scripts for type-check and test execution.
3. Add baseline sample level fixtures.
4. Define determinism guidelines for all engineers.

Exit criteria:

- Shared structure and standards are documented and accepted.

## Phase 1: Domain Models and Validation

1. Define all TypeScript contracts for level and strategy.
2. Implement strict schema validation for all inputs.
3. Implement semantic validators for domain constraints.
4. Add clear validation error mapping.

Exit criteria:

- Valid level JSON can be parsed to typed models.
- Invalid JSON produces actionable errors.

## Phase 2: Physics and Simulation Engine

1. Implement straight acceleration and braking calculations.
2. Implement corner speed safety checks and crash behavior.
3. Implement weather timeline resolver and multipliers.
4. Implement fuel usage and refuel timing.
5. Implement tyre degradation, friction updates, blowout behavior.
6. Implement crawl mode and limp mode transitions.
7. Implement pit timing and pit exit behavior.

Exit criteria:

- Engine reproduces expected outcomes on representative scenario tests.

## Phase 3: Scoring and Traceability

1. Implement Level 1 base score formula.
2. Implement Level 2 and 3 fuel bonus.
3. Implement Level 4 tyre bonus and blowout penalties.
4. Build explainable result objects with score breakdown and event trace.

Exit criteria:

- Score output can be fully traced to input and formula components.

## Phase 4: Deterministic Advanced Optimizer

1. Implement deterministic candidate encoding.
2. Add seeded evolutionary search.
3. Add local refinement and constraint repair.
4. Rank candidates with stable tie-break logic.
5. Provide optimization profiles and budgets.

Exit criteria:

- Same level + same seed yields same top strategy and same output bytes.

## Phase 5: UI and Product Flows

1. Build input panel: upload, paste, sample picker.
2. Build strategy editor and optimizer controls.
3. Build simulation run view and status indicators.
4. Build results panels: tables, penalties, weather, resources, score cards.
5. Build export panel with validation status.

Exit criteria:

- End-to-end user flow works from input to export without manual workarounds.

## Phase 6: Test, Security, and Release Readiness

1. Expand unit and integration tests.
2. Add deterministic regression suite.
3. Run lint, build, and strict type-check.
4. Run security scan for new first-party code and fix findings.
5. Finalize docs and release checklist.

Exit criteria:

- Release gate fully green.

## Suggested Milestone Breakdown

1. Milestone A

- Phases 0-1 complete.

2. Milestone B

- Phases 2-3 complete.

3. Milestone C

- Phase 4 complete.

4. Milestone D

- Phases 5-6 complete and release-ready.

## Risk Register

1. Rule misinterpretation risk

- Mitigation: formula tests and doc-to-code traceability.

2. Determinism drift risk

- Mitigation: byte-equality regression tests.

3. Optimizer runtime risk

- Mitigation: budget controls and profile tiers.

4. Complex UI overload risk

- Mitigation: progressive disclosure and sane defaults.
