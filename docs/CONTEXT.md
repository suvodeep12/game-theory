# Project context — start here

Updated 23 November 2026. This tracked index and the linked records are the project handoff, not an approval certificate. The user explicitly requires project context to remain in the repository. Future changes must update these records rather than rely on chat history.

## Purpose and audience

A playful, visual evolution simulation for everyone, including people unfamiliar with the prisoner's dilemma: six strategies share one living world, compete with their neighbours, and spread or die out over generations. Visitors poke at it: paint strategies and storms of mistakes, rewind, and rewrite history. The model stays honest (no assumed victory for nice strategies, no claims about real people), but the page carries few caveats by the user's request. The initial inspiration is [the user's video](https://www.youtube.com/watch?v=mScpHTIi-kM); its full transcript was not verified. “Game Theory” is a working name.

## Authoritative records

| Subject | Record |
| --- | --- |
| Encounter model (v1): strategies, payoffs, durations, errors, randomness | [Simulation rules](simulation-rules.md), [engine](../src/engine.ts) |
| Evolution grid: payoff tables, neighbourhood, update rule, scenarios, history | [Simulation rules → Evolution grid](simulation-rules.md#evolution-grid--agreed-23-november-2026), [evolution.ts](../src/evolution.ts) |
| Interface | [App.tsx](../src/App.tsx), [styles.css](../src/styles.css) |
| Design system | [DESIGN.md](../DESIGN.md) (strategy palette added 23 Nov) |
| Avatar identities, nice/nasty definition | [Score presentation](score-presentation.md) (identity section still current), [avatar notes](design/avatars/README.md), [v2 provenance](design/avatars/v2-provenance.md) |
| Verified checks and remaining limits | [Validation](validation.md), [verification notes](verification/README.md) |
| Current rendered evidence | [Desktop](design/current/evolution-desktop.png), [phone](design/current/evolution-phone.jpg), [review](design/current/REVIEW.md) |
| Design and feedback history | [Revision history](design/HISTORY.md), [design directions](design-directions.md) |
| Historical lab scope (superseded 23 Nov) | [Product brief](product-brief.md), [guided experiments](guided-experiments.md), [acceptance criteria](acceptance-criteria.md), [implementation plan](implementation-plan.md), [surface contract](hands-on-contract.md), [lab review](design/history/lab-review.md) |
| Contributor instructions and context maintenance | [AGENTS.md](../AGENTS.md) |

## Confirmed constraints

- React + TypeScript; everything runs in the visitor's browser. Vite builds static files; no backend, accounts, analytics, or uploads.
- Rules version 1 is unchanged: six fixed strategies; payoffs CC 3/3, CD 0/5, DC 5/0, DD 1/1; durations 200–500; action and observation error rates sampled 0–10% per encounter; seeded event-separated random streams. Strategy state resets between encounters.
- The grid adds selection between encounters (imitate the best neighbour) and mutation. It does not add memory of opponents or learning inside a strategy; those remain future ideas.
- Nice means never defects first in error-free play; avatars must stay distinct. On the grid, nice strategies are rounded creatures with eyes and Always Defect is a sharp square.

## User feedback and decisions

1. User approved the Hands-on Lab direction after three previews, using Hallmark + Impeccable, with a curious, approachable tone and restrained playfulness.
2. The first implementation passed technical checks, but the user found it extremely confusing, specifically the experiment and results.
3. First simplification exposed one run action, collapsed advanced controls/evidence, and led with cooperation percentages. The user still found it confusing.
4. The user proposed avatars for players/strategies and required them to be distinct and instantly recognizable.
5. The user defined nice as “never defects first” (error-free play): Always Defect is nasty; the other five are nice. Nice does not mean forgiving.
6. The user chose cumulative points after N rounds across all games as the lab's primary score (now historical with the lab).
7. The user requested the project on GitHub as a public repository: [suvodeep12/game-theory](https://github.com/suvodeep12/game-theory). Publishing a repository is not public website hosting.
8. The user requires the entire project context to remain in the repository.
9. **23 Nov 2026:** the user said the lab was "not exactly what I want". Asked which direction, they chose **evolution over generations** and **a visual sim with fewer caveats** (not chosen: play-it-yourself, games beyond the prisoner's dilemma).
10. The user chose to **replace** the guided lab rather than keep it beside the new view. The lab code (topics, share links, cumulative scores, tournament worker) was removed; it is recoverable from commit `d19cc22`.
11. The user chose a **living grid** (spatial, imitate-best-neighbour) over a well-mixed "population river" chart. The river survives as the timeline under the grid.
12. The user asked that work always be **as creative and innovative as possible**. Additions chosen under that brief (proposals the user has not yet reviewed): storm weather you can paint, rewind with a faded "erased future" when you rewrite history, conversion flashes on invasion fronts, brightness showing how well each creature is doing, a palette that doubles as the live leaderboard, an inspector with a 12-round duel strip that marks slips, and four story scenarios.
13. While reviewing the first build, the user reported **"there are no buttons to stop"**: Pause sat in the side panel, below the fold in a single-column layout. Fix: a sticky transport bar (Pause/Play, Step, Restart, generation, speed) directly above the world, matching the ASCII preview they picked.
14. The user found the first **Storm front** (random mix, stormy east) **too confusing**. Fix: a controlled experiment with identical stripes of four nice strategies on both halves, a dashed border around every storm area, stronger rain, a lighter wash, and a key under the world whenever storm exists.
15. **24 Nov 2026:** the user asked to host the project and chose **GitHub Pages** (public) over a private claude.ai link. [`.github/workflows/pages.yml`](../.github/workflows/pages.yml) runs the tests, builds with base `/game-theory/` and deploys on every push to `main`. Site: <https://suvodeep12.github.io/game-theory/>.

## Current implementation

One page: headline, a one-paragraph explanation and a collapsed "How it works". The 48 × 48 world autoplays the *One bad apple* scenario (unless reduced motion is requested). A sticky bar above the world holds Pause/Play, Step, Restart, the generation and speed (1–20 generations/s). The panel holds a paint palette of six strategies (each row shows its live share) plus Storm, Calm, Inspect and a wide brush, four scenarios, and a mutation slider (0–2%, default 0.1%). Under the grid, a stacked population timeline doubles as a rewind control. Keyboard: Space plays/pauses, → steps. On touch screens a tap paints and a swipe scrolls; mouse and pen can drag-paint.

## Verification and limitations

15 Node tests and the production type-check/build pass. Interactive browser checks covered autoplay, scenario stories, rewind, painting into the past (ghost timeline), the storm scenario, the inspector, and 375 px phone width with no horizontal overflow. Impeccable's detector reports no anti-patterns on the running page. Details: [validation](validation.md).

Not established: physical-device or real touch testing (touch tap-vs-swipe logic is untested), Safari/Firefox, screen-reader use of the canvas (it has a text summary only), formal accessibility, beginner comprehension, independent design review, or the user's aesthetic approval of the new screen. The grid's outcomes describe this model only. History is capped at 1,000 generations (playback pauses there). Public host: GitHub Pages (decision 15).

## Next work

- Get the user's reaction to the grid and to the creative additions in decision 12; keep, cut or extend accordingly.
- Possible next ideas (not agreed): shareable world links, a "challenge" mode (e.g. conquer the world with five placements), sound, a tracked headless browser check for the grid.
- Keep context and evidence current in every subsequent change. A push to `main` publishes to the live site.
