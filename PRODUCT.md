# Product

Start with [the complete repository context](docs/CONTEXT.md). Since 23 November 2026 the product is a visual evolution simulation (a living grid) that replaced the guided lab; the user chose evolution over generations, a visual sim with fewer caveats, a living grid, and replacing the lab. Nice still means never defects first in error-free play, and avatars stay distinct. The user requires context to stay in this repository; see [AGENTS.md](AGENTS.md).

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React + TypeScript, built with Vite; everything runs in the visitor's browser and ships as static files. Model: [simulation rules](docs/simulation-rules.md). Evidence: [validation](docs/validation.md).

## Users

People curious about cooperation and conflict, including complete beginners who do not know the prisoner's dilemma. No programming knowledge or account is required. Visitors use phones or computers.

## Product Purpose

Let visitors watch six prisoner's dilemma strategies compete for one world over generations, and poke at it: paint creatures and storms of mistakes, rewind, rewrite history, and inspect any creature to see why it thrives or fails. Cooperation winning is not a required outcome; outcomes come from the model, not from authored conclusions.

## Capabilities and Constraints

[Simulation rules](docs/simulation-rules.md) own exact model definitions; do not copy numbers into design documents.

- One screen: a 48 × 48 world, a population timeline that doubles as rewind, play/pause/step/restart and speed above the world, a strategy palette that doubles as the live leaderboard, storm/calm/inspect tools, four scenarios, and a mutation slider.
- Rules version 1 encounters are unchanged; the grid adds imitate-the-best-neighbour selection and mutation.
- No backend, accounts, monetisation, submissions or leaderboards.
- Few caveats on the page (user request); limits live in the repository docs.

## Voice and Design Commitments

Curious, approachable and playful. Use Hallmark and Impeccable for design. Keep the Hands-on Lab materials: forest-green paper, peach controls, Gabarito headings, Manrope body, the v2 avatar atlas. Creativity is a standing user request: favour inventive interactions over default patterns, while keeping code lean. "Game Theory" remains a working label.

Do not present cooperation/defection as moral labels. Keep copy short.

## Evidence on Hand

The repository contains the running application, engine and grid tests, measured browser checks, and screenshots. See the validation report for exact limits. There is no evidence of user adoption, testimonials, or beginner comprehension; do not invent it.

## Product Principles

- Show, don't lecture: the world should explain itself through motion, brightness and the inspector.
- Every control invites an experiment.
- Let outcomes surprise; never script a winner.
- Keep the model inspectable for the curious.

## Accessibility and Inclusion

Controls are native buttons and ranges with labels; the canvas has a text summary of shares; reduced motion disables autoplay, rain and flashes. Painting needs a pointer. No audit, screen-reader test, physical-device test or beginner study has passed yet.
