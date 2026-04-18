# Success Checklist

Use this checklist before declaring the project release-ready.

## 1. Product Scope

1. Full support for Levels 1-4 rules is implemented.
2. Upload, paste, and sample input workflows are functional.
3. Advanced deterministic optimizer is available.
4. Submission export in required JSON shape is available.

## 2. Rule Fidelity

1. Acceleration and braking behavior matches defined assumptions.
2. Corner speed checks and crash penalties are applied correctly.
3. Crawl mode and limp mode transitions are correct.
4. Fuel usage and refuel timing are correct.
5. Tyre degradation and blowout behavior are correct.
6. Weather timeline and multipliers are correct.
7. Pit entry timing constraints are enforced.

## 3. Scoring Correctness

1. Level 1 base score formula is correct.
2. Level 2 and 3 fuel bonus formula is correct.
3. Level 4 tyre bonus formula is correct.
4. Final score composition is correct per level.

## 4. Determinism

1. Same input and seed always produce same strategy output.
2. Exported file bytes are identical across reruns.
3. Candidate ranking tie-break behavior is stable.

## 5. UX and Explainability

1. Validation errors are specific and actionable.
2. Strategy result includes lap/segment trace.
3. Penalties and mode changes are clearly visible.
4. Score breakdown is understandable and complete.

## 6. Engineering Quality

1. Lint passes.
2. Build passes.
3. Type-check passes.
4. Unit tests pass.
5. Integration tests pass.
6. Regression tests pass.
7. Determinism tests pass.

## 7. Security and Reliability

1. Untrusted JSON is validated before processing.
2. No dynamic code execution from user input.
3. Runtime guardrails protect against invalid numeric states.
4. Security scan completed for newly introduced code.

## 8. Documentation Completeness

1. PRD is current.
2. Architecture doc is current.
3. Development plan is current.
4. Test strategy is current.
5. Backlog and success checklist are current.

## 9. Submission Readiness

1. Export file conforms to required schema.
2. Export file is deterministic and reproducible from source.
3. Example fixture can be regenerated end-to-end.
4. Project can be zipped and shared with clear run instructions.
