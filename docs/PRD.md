# Product Requirements Document (PRD)

## 1. Product Name

Entelect Grand Prix Strategy Platform

## 2. Problem Statement

Participants must produce a deterministic race strategy JSON that optimizes race performance under strict physics, tyre, weather, fuel, and pit stop constraints. Manual planning is slow and error-prone across levels, especially when weather and tyre degradation interactions are introduced.

## 3. Product Vision

Create a browser-based planning and simulation platform that allows users to ingest level JSON, generate and compare strategies, validate rule compliance, and export deterministic submission-ready output.

## 4. Primary Users

1. Competitive participant

- Wants fast, high-scoring strategies with minimal trial-and-error.

2. Technical strategist

- Wants deep insight into simulation trace, constraints, and score contributions.

3. Reviewer/teammate

- Wants reproducible results and transparent assumptions for validation.

## 5. Goals

1. Full support for race rules across Levels 1-4.
2. Deterministic strategy generation and deterministic export artifacts.
3. Advanced optimization beyond static heuristics.
4. Clear explainability of outcomes: speed, fuel, tyre, weather, penalties, score.
5. Fast iteration loop with upload, paste, and sample-level workflows.

## 6. Non-Goals (Initial Scope)

1. Real-time multiplayer collaboration.
2. Server-side persistent accounts and cloud sync.
3. External telemetry ingestion from live race systems.
4. Native mobile app.

## 7. User Stories

1. As a participant, I can upload a level JSON and immediately validate it.
2. As a participant, I can run an optimizer and receive ranked strategies.
3. As a participant, I can inspect lap-by-lap and segment-by-segment results.
4. As a participant, I can export the selected strategy to the required JSON format.
5. As a reviewer, I can rerun the same level + seed and get byte-identical output.
6. As a strategist, I can see why a strategy failed (crash, blowout, limp, fuel out).

## 8. Functional Requirements

### FR-1 Input Management

1. Support level JSON upload from file.
2. Support raw JSON paste input.
3. Support preloaded sample levels from public examples.
4. Validate all inputs against strict schema.

### FR-2 Strategy Configuration

1. Configure initial tyre set.
2. Configure per-straight target speed and braking point.
3. Configure per-lap pit decision, tyre change set ID, and fuel refuel amount.
4. Allow manual strategy editing and auto-generated candidates.

### FR-3 Simulation Engine

1. Simulate race segment by segment and lap by lap.
2. Implement acceleration/deceleration behavior with weather multipliers.
3. Implement corner speed constraints and crash handling.
4. Implement fuel usage, depletion, and refueling.
5. Implement tyre degradation, friction updates, and blowout handling.
6. Implement crawl and limp modes according to rules.
7. Implement weather timeline cycling by race time.

### FR-4 Optimization

1. Run deterministic advanced optimization with fixed seed.
2. Generate multiple candidate strategies and rank by objective.
3. Enforce hard constraints and deterministic tie-breakers.
4. Provide explainable score breakdown and risk summary.

### FR-5 Output and Export

1. Export strategy JSON in required submission shape.
2. Offer download as JSON and TXT artifact.
3. Ensure stable key ordering for deterministic output bytes.

### FR-6 Explainability and Diagnostics

1. Show per-segment timeline with speeds and mode states.
2. Show penalty events with timestamps and causes.
3. Show score components and resource usage breakdown.
4. Display validation and simulation errors in user-friendly format.

## 9. Non-Functional Requirements

1. Determinism: identical input + seed -> identical output bytes.
2. Performance: baseline optimization should return results in a practical local runtime.
3. Reliability: invalid inputs are rejected with clear error messages.
4. Maintainability: clean separation between UI, domain simulation, optimizer, and export.
5. Testability: formulas and transitions must be unit tested.

## 10. Domain Constraints

1. Pit lane accessible only at end of lap.
2. Minimum speed bounded by crawl constant when applicable.
3. No acceleration/deceleration inside corners.
4. Mode transitions must follow official trigger conditions exactly.
5. Weather affects acceleration, deceleration, friction, and degradation.

## 11. Key Success Metrics

1. 100 percent schema-valid exported submissions.
2. 100 percent deterministic replay in regression suite.
3. Zero known critical rule deviations from specification.
4. Successful strategy generation for representative Level 1-4 samples.
5. Complete traceability of score calculation components.

## 12. Release Criteria

1. All FRs implemented and verified.
2. Tests pass for formulas, transitions, and deterministic replay.
3. Lint/build/type-check pass.
4. Documentation complete and current.
5. Security scan run and no unresolved high-severity issues in new code.
