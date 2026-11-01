# Local v1 validation

1 November 2026. This report describes the current local build, not a public release or a validated model of human behaviour.

## Working scope

React/TypeScript with a Vite static build, pure TypeScript engine, one Web Worker per active job, and no backend. All five guided topics are connected: opponent mix, naturally sampled lengths, errors, fixed incentives, and forgiveness. The introduction is playable and skippable.

The app includes 100 repetitions per condition, 21 encounters per repetition, exact replay of a selected encounter, all 100 repetition values, weighted individual/collective measures, actual cooperation, benefit gaps, paired differences, qualified analogies, versioned seeded links, progress, cancellation, and stale-result notices. Future cross-encounter memory and learning remain out of scope.

Fonts are self-hosted under `public/fonts` with their original OFL notices. Sources are the [Gabarito](https://raw.githubusercontent.com/google/fonts/main/ofl/gabarito/OFL.txt) and [Manrope](https://raw.githubusercontent.com/google/fonts/main/ofl/manrope/OFL.txt) notices; the exact served font URLs are recorded in `.cache/font-source.css` from the Google Fonts stylesheet used for the approved preview. No raster assets ship in the application.

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

- No public host, domain, or deployment has been selected or published. Local links work only where this app is reachable; an Internet-accessible origin is needed to share with other people.
- No Safari, Firefox, physical Android/iOS device, assistive-technology audit, or formal WCAG conformance claim.
- No five-beginner comprehension test: volunteers have not been available in this session.
- No phone performance benchmark, cross-version legacy execution, service worker, or offline-install promise.
- No statistical significance test, population evolution, communication, adaptive agent, or real-life predictive validation.

The implementation supports current seeded rules version 1. Future result-affecting changes require a new version; unsupported links fail visibly rather than silently adopting different rules.
