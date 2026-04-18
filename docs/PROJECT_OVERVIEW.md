# Project Overview

## What This Project Is

This project is a strategy planning and simulation tool for the Entelect Grand Prix challenge. It helps users design race actions and evaluate them before submission.

The app is built with Next.js and HeroUI and targets deterministic behavior required by competition validation.

## What Users Can Do

1. Import race level definitions.
2. Build or auto-generate strategy plans.
3. Simulate full race outcomes under official rules.
4. Compare strategy variants and score impact.
5. Export valid submission JSON/TXT artifacts.

## Core Product Areas

1. Input and validation

- Parse and validate race level JSON.

2. Simulation

- Execute race logic over laps and segments.

3. Optimization

- Search for high-scoring deterministic strategy candidates.

4. Explainability

- Show why a strategy won or failed.

5. Export

- Produce deterministic submission-ready artifacts.

## Why Determinism Matters

Competition judges rerun submitted source against provided input and compare outputs. Any non-deterministic behavior can invalidate submissions, even if logic is otherwise correct.

This project treats determinism as a first-class product requirement, not a nice-to-have.

## Planned Information Architecture

1. Simulator workspace

- Input, strategy configuration, simulation run, results.

2. Optimizer workspace

- Search settings, candidate ranking, selection.

3. Docs workspace

- Rules explanation, formulas, usage guidance.

4. Export workspace

- Output preview, validation status, downloadable artifact.

## Expected Deliverables

1. Fully working web dashboard for Levels 1-4.
2. Deterministic simulation + optimization engine.
3. Complete documentation and testing coverage for critical rules.
4. Submission artifact export that matches official schema.
