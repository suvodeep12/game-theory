# Who inherits the world?

**Live:** <https://suvodeep12.github.io/game-theory/>

**Watch the film:** [One bad apple, 39 s](https://github.com/suvodeep12/game-theory/releases/download/film-one-bad-apple/one-bad-apple.mp4) ([release notes and credits](https://github.com/suvodeep12/game-theory/releases/tag/film-one-bad-apple))

A living prisoner's dilemma world in the browser. Six strategies share a 48 × 48 grid; every generation each creature plays its eight neighbours and copies whoever nearby scored best. Paint in defectors or storms of mistakes, rewind, and rewrite history. "Game Theory" is a working name.

**Project handoff:** start with [the context index](docs/CONTEXT.md). It records requirements, decisions, design history, validation, open questions and next steps. [AGENTS.md](AGENTS.md) requires contributors to keep that context in this repository. `npm run check:context` checks local Markdown links (not completeness).

## Run locally

Node 22.12+ on the Node 22 line (verified with 22.23.1). `npm ci`, then `npm run dev`. `npm test` runs the engine and grid tests; `npm run build` type-checks and writes static output to `dist`. No backend, keys, accounts or database; everything runs in the visitor's browser.

## What's inside

- [Simulation rules](docs/simulation-rules.md): the unchanged rules-version-1 encounters (strategies, payoffs, durations, mistakes) and the evolution grid built on them.
- [`src/engine.ts`](src/engine.ts): seeded v1 encounters. [`src/evolution.ts`](src/evolution.ts): payoff tables, grid step, scenarios. [`src/App.tsx`](src/App.tsx): canvas world, timeline, palette, inspector.
- [DESIGN.md](DESIGN.md): the Tabletop design system (cobalt box lid, white cards, six drawn game pieces) and the [Claude Design canvas](https://claude.ai/artifact/JirY1sph2tn7JN3XnXB9g6) it came from. Nice means never defects first: five round-headed pieces, one spiky Always Defect. [`src/Story.tsx`](src/Story.tsx): opening and rules deck. [`src/Pieces.tsx`](src/Pieces.tsx): the pieces.
- [Validation](docs/validation.md): what was actually checked and what was not.
- [`video/`](video/): a 39-second HyperFrames film of the game ("One bad apple"), drawn from the real engine; render with `npm run render` inside `video/`. Credits for its music and sounds: [video/CREDITS.md](video/CREDITS.md).

The guided lab that came before (five topics, cumulative scoreboard) is recorded in the [design history](docs/design/HISTORY.md) and recoverable from commit `d19cc22`.

## Evidence

The initial inspiration was [this video](https://www.youtube.com/watch?v=mScpHTIi-kM). [Axelrod's tournament paper](https://esp.mit.edu/download/2dd80247-be60-4e73-b49d-91b5b6988ff0/S12850_axelrod_1980.pdf) and [Nowak & May's spatial games](https://doi.org/10.1038/359826a0) are the classic background for repeated and spatial prisoner's dilemmas. Neither validates this app's settings or any real-life analogy.
