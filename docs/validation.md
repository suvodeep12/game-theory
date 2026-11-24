# Local validation

Updated 23 November 2026. This report describes local builds, not a public release or a validated model of human behaviour. The newest section is current; everything below it describes the retired guided lab.

## Current: evolution grid (23 November 2026)

**Automated.** `npm test`: 15 pass (9 unchanged v1 engine tests, 6 grid tests). `npm run build`: type check and production build pass (JS 235 kB, 75 kB gzipped). Node v22.23.1. Payoff tables take about 140 ms to compute once at load; one 48 × 48 generation takes about 0.2 ms (Node, this machine).

**Scenario stories** (Node, mutation off, seed `curiosity`): *One bad apple*: defectors reach 873 of 2,304 cells by generation 15, then Tit for Tat holds all 2,304 by generation 60. *Last stand*: 4 → 2,304 Tit for Tat by generation 30. *Even mix*: freezes by generation 15 with Always Defect extinct and the five nice strategies tied. *Storm front* (striped, current): the calm west keeps 288 cells of each stripe; in the stormy east Grim falls to 62 by generation 5, Tit for Tat to 1 by generation 20, Generous to 24, and Win-Stay, Lose-Shift reaches 1,110 of 1,152. (The first, random-mix version gave Win-Stay 1,333 cells overall; the user found it too confusing.)

**Browser** (desktop app's Chromium pane, dev server): autoplay ran with no console errors at 1440 × 1000. In the default run, Always Defect was extinct by generation 100. Rewinding to generation 20 showed the stored world (defectors 70%), and painting there produced "faded: the future you erased" with the ghost drawn in the timeline. The first *Storm front* gave Win-Stay, Lose-Shift 56% of the world; the striped redesign showed intact west stripes and Win-Stay at 59% overall by generation 51, with the dashed storm border and storm key visible. After the user reported no visible stop control, the transport bar moved above the world: clicking Pause held the world at generation 12 for 2 s, the button switched to Play, and the bar stayed pinned at the viewport top (0 px) after scrolling; at 375 px it wraps to two rows without overflow. The inspector showed rule, score, best neighbour, a 12-round duel with slips marked, and the next-generation prediction. At 375 px: no horizontal overflow, 344 px world with visible eyes.

**Impeccable detector.** Source scan: 0 anti-patterns (advisories: new strategy colours and small cell radii, now documented in DESIGN.md). Running-page scan: one finding (share bar drawn as a hard-stop purple gradient), fixed by drawing a solid bar; rescan clean (exit 0).

**Not verified.** Touch tap-vs-swipe behaviour on a real device; Safari/Firefox; screen readers (the canvas exposes a text summary of shares only); keyboard-only painting (painting needs a pointer; play/step/scenarios/rewind are keyboard-reachable); performance on low-end phones; beginner comprehension; independent design review.

## Lab revision: avatars, cumulative scores and durable context

The user selected nice = never defects first (classified in error-free play), distinct nice/nasty avatar families, and primary cumulative points after N rounds across the whole tournament. N counts rounds across all games. The new scoreboard shows six identities with raw points and rounds played, and an exact global cursor over the completed tournament. Encounter totals remain separate. The original weighted averages and cooperation values remain inspectable. This supersedes the cooperation-first result hierarchy described in the earlier revision below.

`npm test`: 13 tests pass, including zero, partial and final tournament sums, both self-play roles, the 2N player-round identity, exact partial-game replay, encounter totals and invalid cursors. `npm run build`: type check and production output pass. Earlier counts of 12 tests below refer to the previous implementation.

The latest headless Edge verification matches displayed raw points/rounds to independent encounter-summary sums, checks zero/first/final timeline positions and identical raw totals for weight-only changes, verifies selected-round encounter totals and self-play labels, confirms six sprite positions plus real transparent background/ring hole, and checks 360/768/1440px document overflow. Tracked [browser evidence](verification/avatar-scores-browser.json) and [current screenshots](design/current/) contain the actual values. Desktop and phone score images and the encounter image were inspected. No claim of beginner recognition or comprehension follows from these checks.

The production raster and exact prompts are tracked in [avatar provenance](design/avatars/v2-provenance.md). [CONTEXT.md](CONTEXT.md) and [AGENTS.md](../AGENTS.md) preserve all material project context in the repository. Historical proposals and review reports are tracked in [design history](design/HISTORY.md). No findings were suppressed by this change; Impeccable hooks remained enabled, with repetitive hints automatically capped by the hook after multiple edits. No new independent finish review covers this revision.

## Working scope

React/TypeScript with a Vite static build, pure TypeScript engine, one Web Worker per active job, and no backend. All five guided topics are connected: opponent mix, naturally sampled lengths, errors, fixed incentives, and forgiveness. The introduction is playable and skippable.

The app includes 100 repetitions per condition, 21 encounters per repetition, exact replay of a selected encounter, all 100 repetition values, weighted individual/collective measures, actual cooperation, benefit gaps, paired differences, qualified analogies, versioned seeded links, progress, cancellation, and stale-result notices. Future cross-encounter memory and learning remain out of scope.

Fonts are self-hosted under `public/fonts` with their OFL notices. Sources are the [Gabarito](https://raw.githubusercontent.com/google/fonts/main/ofl/gabarito/OFL.txt) and [Manrope](https://raw.githubusercontent.com/google/fonts/main/ofl/manrope/OFL.txt) notices. The latest revision ships one generated transparent avatar atlas; [its provenance](design/avatars/v2-provenance.md) is tracked. Earlier versions shipped no raster assets.

## Automated model and link checks

`npm test`: 12 tests passed. They include hand-derived payoff/reactive-strategy cases, reset behaviour, forgiveness endpoints, true-payoff WSLS feedback, independent self-play, integer rejection sampling, matched errors, exact replay, self-play weighting, variable-length normalization, the 2,100-encounter schedule, and invalid/unsupported share payloads.

`npm run build`: type checking and production build pass. The engine/worker and interface compile as separate browser assets. Node v22.23.1 and npm 10.9.8 were used. Dependency installation reported no known vulnerabilities at install time; that is not an ongoing security guarantee.

## Browser execution

Headless Microsoft Edge 156.0.4314.50 on this Windows workspace exercised:

- Five introductory rounds and hand-derived payoff feedback.
- All four real worker error conditions, matching the unit-checked engine's aggregate output.
- Model navigation without discarding results, changed-setting warnings, cancellation with no partial result, all-zero mix rejection, and a valid weighted mix.
- Forgiveness controls including 100%, length plots with 100 real encounters and text tables, and the fixed-incentive walkthrough.
- Sharing completed settings rather than subsequently edited controls; clipboard fallback; a fresh browser page regenerating the same settings and selected encounter.
- Unsupported versions rejected before simulation, and no document overflow at 360, 768, and 1440 CSS pixels.

Production preview on port 4173 completed the four-mode workload in 1.39–3.71 seconds across observed runs. Its measured collective/cooperation/gap outputs matched the development verification, all 100 repetition rows were present, and the network check observed no external requests. No page errors were observed. These are desktop/browser measurements, not a phone or universal performance claim.

Local diagnostic scripts and JSON evidence are in `.cache/browser-check.mjs`, `.cache/browser-check.json`, `.cache/production-check.mjs`, and `.cache/production-check.json`. They use the existing local headless-browser runtime and are intentionally not a portable CI dependency. The engine/link test files under `tests` use Node's built-in runner.

## Design checks

Both Hallmark and Impeccable were used. The Squeeze material and Hands-on Lab direction were approved before implementation. Impeccable's hooks dispatched on actual edits and remain enabled.

Hallmark's runtime scan reports no Floor failures or Reflex findings. A finish warning notes offscreen mobile table columns; these are intentional local scrollers with pinned row identities. Fresh reviews identified missing scrolling hints/caption wrapping and loss of the opening illustration after completion. Those were corrected. Impeccable's fresh reviewer scored its two fixes resolved. Hallmark confirmed the hints and captions resolved, then identified one remaining payoff-row pinning omission. That CSS fix was applied and checked locally; independent final scoring was unavailable because the reviewer calls hit the agent usage limit. Reports and recaptures are in `.impeccable/review`. No findings were suppressed.

Completed screenshots were explicitly captured after a four-second wait. Earlier `.impeccable/review/results` images captured an in-progress job and are evidence of the running state, not completed output. Correct completed evidence is under `.impeccable/review/completed`.

## Not checked or not released

### Experiment/result usability revision

After the user identified the working experiment and results as confusing, the default flow was simplified without changing the simulation engine or seeded rules. A labelled question selector replaces the topic strip. The experiment explains the comparison and exposes one run action; optional settings, prediction, and rule examples are collapsed. Results lead with measured cooperation percentages and a visible limitation. Scores, ranges, repetition values, and encounter replay remain expandable. Completion moves focus to the results heading.

The revision passed all 12 model/link tests, type checking, production build, and `.cache/simplified-check.mjs`: default disclosure state, summary numbers against the engine for all four mistake situations, focused completion, expanded evidence, shared completed settings/view, stale notices, cancellation, invalid mix rejection, all five topics, and layout at 360/768/1440px. Updated desktop/phone screenshots are in `.impeccable/review/simplified`. `.cache/simplified-production-check.mjs` also checks the built app's summary, all 100 repetition rows, overflow, requests, and page errors. These are local technical checks; beginner comprehension and the user's assessment of the new flow are still unverified. Earlier finish reviews describe the previous layout, not this revision. No findings were suppressed.

### Remaining limits

- Hosted on GitHub Pages at <https://suvodeep12.github.io/game-theory/> (no custom domain). Each push to `main` re-runs the tests and redeploys.
- No Safari, Firefox, physical Android/iOS device, assistive-technology audit, or formal WCAG conformance claim.
- No five-beginner comprehension test: volunteers have not been available in this session.
- No phone performance benchmark, cross-version legacy execution, service worker, or offline-install promise.
- No statistical significance test, population evolution, communication, adaptive agent, or real-life predictive validation.

The implementation supports current seeded rules version 1. Future result-affecting changes require a new version; unsupported links fail visibly rather than silently adopting different rules.
