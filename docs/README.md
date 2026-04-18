# Entelect Grand Prix Documentation

This folder contains the full product and engineering documentation for the Entelect Grand Prix Strategy Platform.

## Documentation Index

1. [PRD](./PRD.md)

- Product goals, users, requirements, constraints, and acceptance criteria.

2. [Project Overview](./PROJECT_OVERVIEW.md)

- Plain-language explanation of what the app does and how it is expected to be used.

3. [Technical Architecture](./TECHNICAL_ARCHITECTURE.md)

- Proposed system architecture, module responsibilities, data contracts, and determinism approach.

4. [Development Plan](./DEVELOPMENT_PLAN.md)

- Phased implementation plan, sequencing, dependencies, and delivery milestones.

5. [Algorithms and Rules](./ALGORITHMS_AND_RULES.md)

- Domain formulas, simulation behavior, weather and tyre logic, penalties, and scoring rules.

6. [Implementation Backlog](./IMPLEMENTATION_BACKLOG.md)

- Detailed work breakdown and task checklist by epic.

7. [Test Strategy](./TEST_STRATEGY.md)

- Unit, integration, regression, and determinism testing plan.

8. [Success Checklist](./SUCCESS_CHECKLIST.md)

- Delivery readiness checklist for product, engineering, and submission quality.

## Recommended Reading Order

1. PRD
2. Project Overview
3. Technical Architecture
4. Development Plan
5. Implementation Backlog
6. Algorithms and Rules
7. Test Strategy
8. Success Checklist

## Guiding Principles

- Deterministic outputs for identical inputs and seeds.
- Rule fidelity to Entelect race constraints and scoring.
- Safety first: invalid/unsafe strategies must be rejected or repaired.
- Extendability: Level 1-4 support with clean boundaries for future features.
- Explainability: every simulation and optimization result should be inspectable.
