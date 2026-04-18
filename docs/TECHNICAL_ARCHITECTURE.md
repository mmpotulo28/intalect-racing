# Technical Architecture

## 1. Architecture Goals

1. Rule-accurate race simulation.
2. Deterministic execution from input to export.
3. Strong separation between domain logic and UI.
4. Extensibility for future levels and scoring changes.

## 2. High-Level Layers

1. Presentation Layer

- Next.js App Router pages and HeroUI components.
- Handles input forms, tables, and visualization.

2. Application Layer

- Orchestrates flows: parse -> validate -> simulate -> optimize -> export.
- Maintains state and user operations.

3. Domain Layer

- Core racing models and formulas.
- Simulation engine, scoring, transition logic.

4. Infrastructure Layer

- Local file parsing, export utilities, sample data loading.
- Optional future API adapters.

## 3. Proposed Module Structure

- app/
    - simulator/
    - optimizer/
    - docs/
- components/
    - simulator/
    - optimizer/
    - common/
- lib/
    - types/
    - validation/
    - simulation/
    - optimizer/
    - export/
    - parser/
    - constants/
- public/examples/

## 4. Core Domain Contracts

### Input Contracts

1. Level configuration

- car, race, track, tyres, weather sections.

2. Strategy configuration

- initial tyre, per-segment straight actions, per-lap pit actions.

### Output Contracts

1. Simulation result

- total time, score, lap trace, penalties, fuel summary, tyre summary.

2. Submission artifact

- initial_tyre_id and lap actions in official JSON shape.

## 5. Simulation Pipeline

1. Parse JSON source.
2. Validate schema and semantic constraints.
3. Initialize deterministic run context.
4. Iterate laps and track segments.
5. Resolve weather at current race time.
6. Apply segment physics and resource updates.
7. Apply penalties and state transitions.
8. Compute final score components.
9. Emit trace and export-ready strategy object.

## 6. Determinism Strategy

1. Fixed seed for any randomized optimization.
2. Stable sorting with explicit tie-breakers.
3. Canonical floating-point rounding policy.
4. Stable JSON serialization with deterministic key order.
5. Deterministic iteration order over objects and arrays.

## 7. Error Handling

1. Input validation errors

- Field-level path, expected type/range, actionable message.

2. Simulation semantic errors

- Invalid pit action, unavailable tyre IDs, impossible constraints.

3. Runtime safety errors

- Numeric instability guardrails and boundary assertions.

## 8. Testing Boundaries

1. Unit tests at formula and transition level.
2. Integration tests across full simulation pipeline.
3. Regression tests for deterministic output equality.
4. Contract tests for output schema compliance.

## 9. Security and Reliability Notes

1. Treat imported JSON as untrusted input.
2. Strict schema checks before processing.
3. No dynamic code evaluation from user data.
4. Cap optimizer budgets to prevent browser lockup.

## 10. Performance Considerations

1. Keep baseline optimizer runtime reasonable for local browser use.
2. Use memoized derived metrics where applicable.
3. Defer heavy visualization while optimization is in progress.
4. Support quick mode and deep mode optimization profiles.
