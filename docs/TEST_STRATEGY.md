# Test Strategy

## 1. Objectives

1. Verify domain rule fidelity.
2. Verify deterministic output behavior.
3. Verify end-to-end submission correctness.

## 2. Test Layers

### 2.1 Unit Tests

Scope:

1. Kinematics formulas.
2. Corner speed and crash trigger logic.
3. Tyre degradation and friction updates.
4. Fuel consumption and depletion transitions.
5. Pit timing and refuel calculations.
6. Weather timeline progression and cycling.
7. Scoring formulas per level.

Expected outcome:

- Formula-level correctness with tight tolerance rules.

### 2.2 Integration Tests

Scope:

1. Parse -> validate -> simulate pipeline.
2. Simulate -> score -> export pipeline.
3. Manual strategy and optimized strategy execution.

Expected outcome:

- Full workflows succeed for valid fixtures and fail clearly for invalid fixtures.

### 2.3 Regression Tests

Scope:

1. Known sample levels for each level category.
2. Golden output snapshots of strategy and score breakdown.

Expected outcome:

- No unexpected behavior drift across commits.

### 2.4 Determinism Tests

Scope:

1. Same input + same seed repeated runs.
2. Byte-for-byte output comparison for export JSON/TXT.
3. Stable ordering of candidate rankings.

Expected outcome:

- Exact output identity across runs.

## 3. Test Data

1. Minimal level fixture for each rule cluster.
2. Edge-case fixtures:

- extremely short straight
- near-limit corner radius
- near-zero fuel path
- tyre blowout boundary case
- weather cycle rollover case

3. Full representative fixtures for Levels 1-4.

## 4. Tooling Recommendations

1. Unit/integration test runner: Vitest or Jest.
2. Type checks: TypeScript noEmit.
3. Lint checks: ESLint.
4. Optional browser flow tests: Playwright.

## 5. Release Quality Gate

Release is blocked unless:

1. Unit tests pass.
2. Integration tests pass.
3. Determinism suite passes.
4. Build and type-check pass.
5. Export schema contract tests pass.

## 6. Traceability Matrix

Each functional requirement in PRD should map to at least one automated test case.

Example mapping:

1. FR-3 Simulation engine

- Covered by segment transition tests and full race integration tests.

2. FR-4 Optimization

- Covered by seeded optimizer determinism and ranking stability tests.

3. FR-5 Export

- Covered by schema validation and byte-equality snapshot tests.
