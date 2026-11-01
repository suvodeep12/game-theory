# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Confirmed and implemented locally: React + TypeScript, built with Vite, with simulations running entirely in the visitor's browser and production output as static files. The user approved the technical plan and selected Hands-on Lab before implementation. See the [implementation plan](docs/implementation-plan.md) and [validation report](docs/validation.md).

## Users

People curious about cooperation and conflict, including complete beginners who do not know the prisoner's dilemma. No programming knowledge or account is required. Visitors use phones or computers.

## Product Purpose

Let visitors explore repeated prisoner's dilemma tournaments, understand the behaviour behind results, and consider qualified applications in life. Cooperation winning is not a required outcome. Findings are conditional on this model and its tested settings.

## Capabilities and Constraints

The [product brief](docs/product-brief.md) records the approved scope; [simulation rules](docs/simulation-rules.md) own exact model definitions. Keep those as the authorities for mechanics rather than copying numeric rules into separate design documents.

- Skippable introduction and five guided topics; no separate sandbox.
- Built-in strategies, inspectable encounters, reproducible links, multiple measures of success, and descriptive uncertainty.
- Adjustable opponent proportions, error-type modes, and forgiveness. Length bounds, error bounds, and payoffs stay fixed in v1.
- No backend, accounts, monetisation, submissions, or public competition leaderboard in v1.
- Memory across encounters and learning/adaptation are requested for a future version, not v1 scaffolding requirements.

## Voice and Design Commitments

Confirmed: curious and approachable, with restrained playfulness. Use both Hallmark and Impeccable for design. The user selected Hands-on Lab: forest-green Squeeze material, pale encounter stage, peach controls, Gabarito headings, and Manrope body type. The approved preview and implementation contract are recorded in [design directions](docs/design-directions.md) and [the direction contract](docs/hands-on-contract.md). "Game Theory" remains a working label, not an approved permanent brand.

Explain unfamiliar terms in context. Do not present cooperation/defection as moral labels. Separate findings, model explanations, possible life applications, and analogy limits.

## Evidence on Hand

The repository contains the running application, engine/link tests, measured browser verification, and captured UI evidence. See the validation report for exact limits. Simulation findings are generated from the selected settings and seed, not authored ahead of time. There is no evidence of user adoption, testimonials, or beginner comprehension; do not invent it.

## Product Principles

- Make experiments understandable from zero prior knowledge.
- Let findings challenge expectations.
- Keep conditions and supporting evidence inspectable.
- State uncertainty and the limits of human analogies.
- Keep each guided topic focused and reveal technical detail progressively.

## Accessibility and Inclusion

Beginner comprehension is a confirmed goal. If volunteers are available, use the five-person comprehension check in the product brief. Concrete keyboard, screen-reader, contrast, motion, and responsive checks are proposed in the implementation plan; no audit or user test has passed yet.
