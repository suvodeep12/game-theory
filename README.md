# Repeated Prisoner's Dilemma Explorer

Local v1 implemented · 1 November 2026 · Hands-on Lab selected. "Game Theory" is a working description, not a permanent product name.

A public, account-free website where complete beginners can explore repeated prisoner's dilemma tournaments, inspect what happened, and draw qualified conclusions. Exploration is the goal; cooperation winning is not a required outcome.

This React/TypeScript app runs seeded tournaments entirely in the browser. The user-approved model and design are documented below. The app is available locally; public hosting has not been configured.

## Run locally

Use Node 22.12 or newer on the Node 22 line (verified with 22.23.1). Install the pinned lockfile dependencies with `npm ci`, then run `npm run dev`. Use `npm test` for engine/link checks and `npm run build` for type checking plus static output in `dist`. `npm run preview` serves that build locally; it is not a production hosting service.

There is no backend, secret key, account configuration, or database. The interface, worker, and fonts are served from the same origin.

## Read the draft

1. [Product brief](docs/product-brief.md): purpose, audience, agreed scope, and remaining decisions.
2. [Simulation rules](docs/simulation-rules.md): strategies, scoring, errors, randomness, and scientific limits.
3. [Guided experiments](docs/guided-experiments.md): five investigations and how to explain them.
4. [V1 acceptance criteria](docs/acceptance-criteria.md): observable requirements and checks for a future implementation.
5. [Implementation plan](docs/implementation-plan.md): proposed architecture, design workflow, milestones, verification, and deployment gates.
6. [First design review](docs/design-directions.md): static visual proposals and their verification status.
7. [Validation](docs/validation.md): actual model, browser, production-build, and design evidence, with untested surfaces stated explicitly.

[PRODUCT.md](PRODUCT.md) provides confirmed product context for design tools and points to the detailed rules above.

## Avatar concept

The proposed [six-character cast sheet](docs/design/avatars/cast-v1.png) explores distinct strategy identities. [Design notes and generation prompt](docs/design/avatars/README.md) record its intended use and limits. This is a concept awaiting review; the characters are not integrated into the app yet.

## Status labels

- **Agreed:** explicitly accepted during discovery.
- **Proposed:** a concrete draft recommendation awaiting agreement.
- **Open:** a decision or definition still needed before implementation.

Product/model decisions are recorded through Q53 and consolidated scope was confirmed in Q54. The technical plan and Hands-on Lab direction were then approved. The local implementation follows those decisions; public deployment remains a separate review.

## Evidence

The initial inspiration was [this video](https://www.youtube.com/watch?v=mScpHTIi-kM). Its full transcript has not been verified here.

[Axelrod's original tournament paper](https://esp.mit.edu/download/2dd80247-be60-4e73-b49d-91b5b6988ff0/S12850_axelrod_1980.pdf) motivates comparing repeated interactions. A [later study across many strategies and tournament settings](https://arxiv.org/abs/2001.05911) cautions against generalizing from a narrow selection of opponents. Neither source validates this app or its real-life analogies.
