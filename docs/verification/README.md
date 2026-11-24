# Verification evidence

## Current: evolution grid (23 November 2026)

`npm test` runs 16 tests: the 9 unchanged rules-version-1 engine tests and 7 grid tests (inspector duel opponent, payoff tables from v1 encounters, wrap-around neighbours, calm/storm scoring, one-ring defector spread and tie retention, Tit for Tat invasion of a defector world, reproducible steps and mutation). `npm run build` type-checks and builds. Both require only the pinned project dependencies.

Browser checks were run interactively in the Claude desktop app's browser pane against `npm run dev`, plus Impeccable's detector against the running page. The measured results are recorded in [validation](../validation.md). There is no tracked headless browser script for the grid yet; the screenshots in [current](../design/current/) were captured by hand (desktop with headless Edge at generation 0, phone from the browser pane at 375 px).

## Historical: guided lab (1 November 2026)

The lab's headless checks used `scripts/verify-browser.mjs` and `scripts/verify-production.mjs` (removed with the lab; recover from commit `d19cc22`). Their outputs remain as [avatar/score evidence](avatar-scores-browser.json) and [production evidence](production-browser.json). They describe the lab, not the current app.

Headless Edge and the desktop app's Chromium pane are the only browsers used. No physical device, Safari/Firefox, screen-reader assessment, formal WCAG certification, recognition study or beginner comprehension result has been established. Do not substitute screenshots or passing tests for those findings.
