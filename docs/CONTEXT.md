# Project context — start here

Updated 23 November 2026. This tracked index and the linked records are the project handoff, not an approval certificate. The user explicitly requires project context to remain in the repository. Future changes must update these records rather than rely on chat history.

## Purpose and audience

A playful, visual evolution simulation for everyone, including people unfamiliar with the prisoner's dilemma: six strategies share one living world, compete with their neighbours, and spread or die out over generations. Visitors poke at it: paint strategies and storms of mistakes, rewind, and rewrite history. The model stays honest (no assumed victory for nice strategies, no claims about real people), but the page carries few caveats by the user's request. The initial inspiration is [the user's video](https://www.youtube.com/watch?v=mScpHTIi-kM); its full transcript was not verified. “Game Theory” is a working name.

## Authoritative records

| Subject | Record |
| --- | --- |
| Encounter model (v1): strategies, payoffs, durations, errors, randomness | [Simulation rules](simulation-rules.md), [engine](../src/engine.ts) |
| Evolution grid: payoff tables, neighbourhood, update rule, scenarios, history | [Simulation rules → Evolution grid](simulation-rules.md#evolution-grid--agreed-23-november-2026), [evolution.ts](../src/evolution.ts) |
| Interface | [App.tsx](../src/App.tsx) (board, routing), [Story.tsx](../src/Story.tsx) (opening, rules deck), [Pieces.tsx](../src/Pieces.tsx), [styles.css](../src/styles.css) |
| Design system | [DESIGN.md](../DESIGN.md) (Tabletop, 24 Nov); design canvas: <https://claude.ai/artifact/JirY1sph2tn7JN3XnXB9g6> |
| Piece identities, nice/nasty definition | [DESIGN.md → The pieces](../DESIGN.md#the-pieces); earlier avatar atlases (retired 24 Nov): [avatar notes](design/avatars/README.md), [v2 provenance](design/avatars/v2-provenance.md) |
| Video (HyperFrames, 39 s) | [video/](../video/): [storylines](../video/STORYLINES.md), [spec](../video/SPEC.md), [review](../video/REVIEW.md), [credits](../video/CREDITS.md); board frames come from the real engine via [make-data.mts](../video/tools/make-data.mts) |
| Verified checks and remaining limits | [Validation](validation.md), [verification notes](verification/README.md) |
| Current rendered evidence | [Opening](design/current/tabletop-opening-desktop.jpg), [board](design/current/tabletop-board-desktop.jpg), [phone rules](design/current/tabletop-rules-phone.jpg), [phone piece card](design/current/tabletop-piece-card-phone.jpg); previous grid: [history](design/history/evolution-grid/) |
| Design and feedback history | [Revision history](design/HISTORY.md), [design directions](design-directions.md) |
| Historical lab scope (superseded 23 Nov) | [Product brief](product-brief.md), [guided experiments](guided-experiments.md), [acceptance criteria](acceptance-criteria.md), [implementation plan](implementation-plan.md), [surface contract](hands-on-contract.md), [lab review](design/history/lab-review.md) |
| Contributor instructions and context maintenance | [AGENTS.md](../AGENTS.md) |

## Confirmed constraints

- React + TypeScript; everything runs in the visitor's browser. Vite builds static files; no backend, accounts, analytics, or uploads.
- Rules version 1 is unchanged: six fixed strategies; payoffs CC 3/3, CD 0/5, DC 5/0, DD 1/1; durations 200–500; action and observation error rates sampled 0–10% per encounter; seeded event-separated random streams. Strategy state resets between encounters.
- The grid adds selection between encounters (imitate the best neighbour) and mutation. Since decision 18 it also offers a designed seventh piece and a Kaleidoscope one-shot mode, both alongside v1, not changes to it. It does not add memory of opponents or learning inside a strategy; those remain future ideas.
- Nice means never defects first in error-free play; the pieces must stay distinct. Nice pieces have round heads (circles on the board); Always Defect is the spike (a square on the board).

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
16. **24 Nov 2026:** the user reported the inspector's 12-round strip was all C "for everyone". Cause: it duelled the best-scoring neighbour, almost always a nice strategy, and nice vs nice in calm weather never defects. Fix: the strip now duels the *toughest* neighbour (the one the creature earns least against in the averaged tables, ties going to the higher scorer), and an all-C calm duel gets a line explaining why.
17. **24 Nov 2026:** the user asked to "design the UI of the page from scratch", every detail excellent, with liberty to decide, then said to use Claude Design. Asked first, they chose: **everything new** (creatures too), **story first**, **three rough directions first**, **no new features**. From the canvas's three directions (*Night Culture*, *Tabletop*, *Pictogram*) they chose **Tabletop**, approved the polished canvas, and said "Build it". Decisions taken under that liberty and shown on the canvas before the build: *turn* replaces *generation* and *Reset* replaces *Restart* in the interface; two new banners (one kind holds every square; the score track is full at turn 1,000); returning visitors skip the story on that device. The Hands-on Lab materials (forest green, peach, Gabarito/Manrope, avatar atlas) are retired. Canvas: <https://claude.ai/artifact/JirY1sph2tn7JN3XnXB9g6>.
18. **24 Nov 2026:** from a brainstorm of ways to make the project more impressive, the user chose two groups: **it explains itself** (moments narrated on the score track, live rules cards, a Kaleidoscope setup, design-your-own piece) and **it feels crafted** (sound off by default, piece personality, bigger worlds). They dropped installable/offline mode mid-build. Then they asked for a video of the project made with HyperFrames. Model details: [simulation rules → Additions](simulation-rules.md#additions-on-the-board--24-november-2026).

## Current implementation

Three screens in one page, addressed by URL hash so the browser's Back button works: the **opening** (no hash), the **rules** (`#rules`, five cards: the choice with a try-it, the six pieces, neighbours, copy the best, your powers; ←/→ flip) and the **board** (`#board`). A first visit starts on the opening; once the board has been seen, that device opens straight on the board (localStorage `gt-seen-rules`). The board autoplays *One bad apple* when first shown (unless reduced motion is requested). Above it: Play/Pause, Next turn, Reset, the turn and speed (1–20 turns/s). Beside it: the piece card (when inspecting), the tray of six pieces with live shares and a *Leading* badge, Storm/Calm/Inspect/Big brush, four setup cards, and mutation (0–2%, default 0.1%). Under it: the score track, which doubles as rewind. Banners cover one kind holding every square, the full score track at turn 1,000, and a paused first turn. Keyboard: Space plays/pauses, → steps, Escape closes the piece card. On touch screens a tap paints and a swipe scrolls; mouse and pen can drag-paint. Phones get icon-only transport buttons, a seven-across tray and a bottom-sheet piece card. Since decision 18: the score track carries pins and a list of *moments* (tap to jump); rules card 1 is a five-round match against a hidden piece, and cards 3–4 show a real neighbourhood from the board that changes next turn; the tray has a seventh piece you design; a *Kaleidoscope* setup card with a temptation slider; a 48 × 48 or 96 × 96 board; synthesised sound (off by default, remembered); pieces blink, the shelf bobs, hovered pieces hop and converted pieces pop.

## Verification and limitations

20 Node tests and the production type-check/build pass. Browser checks of the Tabletop build covered every screen and board state at 1440 × 900, 1024 × 768, 375 × 812 and 320 × 640 with no horizontal overflow. Details: [validation](validation.md).

Not established: physical-device or real touch testing (touch tap-vs-swipe logic is untested), Safari/Firefox, screen-reader use of the canvas (it has a text summary only), formal accessibility, beginner comprehension, independent design review, or the user's reaction to the built Tabletop page (they approved the canvas, not yet the build). Reduced motion was checked by reading the code, not by emulation. The grid's outcomes describe this model only. History is capped at 1,000 generations (playback pauses there). Public host: GitHub Pages (decision 15).

## Next work

- Get the user's reaction to the built Tabletop page and to the decisions listed in decision 17; keep, cut or extend accordingly.
- Possible next ideas (not agreed): shareable world links, a "challenge" mode (e.g. conquer the world with five placements), sound, a tracked headless browser check for the grid.
- Keep context and evidence current in every subsequent change. A push to `main` publishes to the live site.
