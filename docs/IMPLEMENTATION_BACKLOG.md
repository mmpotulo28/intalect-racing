# Implementation Backlog

This backlog is organized by epics. Use it as the execution checklist for development.

## Epic A: Domain and Validation

1. Define base domain types for all race entities.
2. Define strategy action types and output contracts.
3. Implement schema validation for level input JSON.
4. Implement semantic validation (pit rules, tyre IDs, ranges).
5. Add parse and normalize utilities.
6. Add deterministic serializer utility.

Definition of done:

- All domain contracts compile and validation catches invalid cases.

## Epic B: Simulation Core

1. Implement weather resolver by elapsed time.
2. Implement straight segment engine with accel/braking windows.
3. Implement corner segment engine with safety checks.
4. Implement crash handling and crawl mode.
5. Implement fuel usage and depletion handling.
6. Implement tyre degradation and blowout handling.
7. Implement pit stop processing and exit speed handling.
8. Build lap and race orchestrator.
9. Build rich event trace output for debugging.

Definition of done:

- Engine passes scenario tests for all required behaviors.

## Epic C: Scoring and Reporting

1. Implement base score formula.
2. Implement fuel bonus formula.
3. Implement tyre bonus formula.
4. Build final score composition per level.
5. Build result breakdown model for UI rendering.

Definition of done:

- Score calculations match test fixtures exactly.

## Epic D: Optimizer

1. Define strategy genome and mutation operators.
2. Build deterministic candidate initialization.
3. Build deterministic crossover and mutation.
4. Build local refinement pass.
5. Build constraint repair/penalty system.
6. Build deterministic ranker with tie-breaks.
7. Expose optimizer profiles (quick/deep).

Definition of done:

- Optimizer returns stable best candidate for same level + seed.

## Epic E: Frontend Workflows

1. Build input module (upload, paste, sample).
2. Build validation feedback panel.
3. Build manual strategy editor.
4. Build optimizer control panel.
5. Build run and progress panel.
6. Build results tables and timeline panels.
7. Build score cards and penalty breakdown.
8. Build export panel and downloadable artifact.

Definition of done:

- Full user workflow works in browser from input to export.

## Epic F: Test and Quality

1. Add formula unit tests.
2. Add transition unit tests.
3. Add pipeline integration tests.
4. Add deterministic regression tests.
5. Add schema contract tests.
6. Add lint/build/type-check CI checks.
7. Add security scan gate for new code.

Definition of done:

- Quality gate green and no release blockers.

## Epic G: Documentation

1. Keep PRD and architecture current with implementation.
2. Add user quick-start guide.
3. Add troubleshooting guide for validation and simulation errors.
4. Add contributor guide for adding new rules.

Definition of done:

- Docs align with current behavior and workflows.
