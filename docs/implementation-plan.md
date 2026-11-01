# V1 implementation plan

Status: technical plan approved by the user's "go" on 1 November 2026, with the explicit instruction to show the design first. Hands-on Lab was then selected and implemented locally; current verification is recorded in [validation](validation.md). Product discovery was confirmed after Q54. Public deployment still requires a concrete hosting review.

## Confirmed technical and design choices

- React + TypeScript.
- Simulations run entirely in the visitor's browser; the deployed website consists of static files.
- Curious and approachable tone with restrained playfulness.
- Both Hallmark and Impeccable participate in design.
- Preserve all model and scope decisions in the [brief](product-brief.md) and [rules](simulation-rules.md).

## Recommended architecture

Use Vite to build the React application. Keep a pure TypeScript simulation module independent of React, the DOM, and worker APIs. Run it in one dedicated Web Worker. A small worker entry translates requests, progress, completed results, and failures; the browser UI owns navigation and display state.

This separates the code we must verify mathematically from the interface. React renders measured results; it does not implement its own second version of scoring or strategy behaviour.

Start with ordinary React state and native controls. Use CSS and simple SVG for the required charts, backed by readable tables. Do not add a router, global state library, chart package, component kit, backend, database, service worker, or animation library without a concrete unmet requirement.

React's [from-scratch guide](https://react.dev/learn/build-a-react-app-from-scratch) documents Vite's React/TypeScript template and also notes the responsibilities a client-only app must handle itself. This product currently needs no server data loading or server rendering. Vite [supports worker bundling](https://vite.dev/guide/features.html#web-workers) and [static deployment](https://vite.dev/guide/static-deploy.html).

### Proposed module boundaries

| Area | Responsibility | What must remain outside it |
| --- | --- | --- |
| Simulation | Strategy rules, deterministic randomness, encounters, tournament statistics, replay | React, DOM, network, storage |
| Worker entry | Validated run/replay messages, progress, results, error delivery | Presentation and duplicated model logic |
| Experiment definitions | Allowed comparisons and explanatory content for the five topics | Predetermined findings or hidden rule overrides |
| React interface | Introduction, guided controls, run state, results, encounter inspector | Independent scoring implementation |
| Share-link handling | Parse/validate/version settings, seed, and selected view | Stored result uploads or private data |

Create files as these responsibilities need them, not a framework of empty directories. Existing docs and `.codex/hooks.json` are the only project material to preserve; there are no existing application callers or exports to migrate.

## Workload and execution

One condition contains 21 encounters per repetition and 100 repetitions: 2,100 encounters. At 200–500 rounds, this is 420,000–1,050,000 two-player rounds per condition, averaging 735,000. A two-condition comparison doubles that work; a four-mode error comparison can reach 4,200,000 rounds. These are arithmetic bounds, not measured runtime claims.

Process one requested investigation at a time. Repeated clicks must not create overlapping workers. Report progress by completed repetitions; cancellation terminates the worker and leaves no partial result labelled complete. Ignore messages from an obsolete run identifier.

Proposed operational bounds: at most the four agreed error conditions in one job; fixed six-strategy roster, fixed 100 repetitions, and fixed model limits. Do not accept arbitrary condition arrays, repetition counts, or model constants from a URL. Use user cancellation and a clearly reported 30-second timeout as an initial safeguard, not silent truncation. Tune only from measured evidence and document any change.

Retain compact per-encounter summaries for scoring, distributions, and length inspection. Reproduce a selected encounter on demand for its detailed trace rather than keeping every round's intentions, actions, and perceptions in memory. Replay must use the exact same engine and randomness scheme as the tournament.

Changing opponent weights can reuse the same encounter summaries because v1 strategies do not adapt to the population mix. Recompute both focal-strategy and population-weighted statistics; do not claim that a reweighted result is a newly simulated population. A changed forgiveness rule requires rerunning affected encounters with matched random events.

## Deterministic engine and verification first

1. Implement simultaneous choices, the fixed payoff matrix, the six strategies, reset rules, and errors exactly as documented.
2. Define and pin the random generator, seed encoding, stable pair identities, and event stream keys. Keep lengths, error rates, error flips, and forgiveness decisions in separate deterministic streams. Do not use `Math.random()` for result-affecting events.
3. Verify integer length mapping and probability boundaries. A new seed is distinct from rerunning the same seeded experiment.
4. Implement the 21-pair schedule, self-play averaging, encounter-average scoring, population weighting, and paired condition differences once in shared code.
5. Add encounter replay and confirm it reproduces the stored encounter summary exactly.

Use Node's built-in test runner and assertions for the pure engine where practical, with TypeScript checking separately. Avoid a separate test framework just for pure function tests; exact test scripts and the TypeScript module configuration are part of scaffolding. Add browser integration checks for worker lifecycle, cancellation, shared links, and rendering; do not pretend a Node test validates browser behaviour.

Required evidence includes the deterministic cases in [acceptance criteria](acceptance-criteria.md), hand-calculated unequal-length/unequal-weight examples, self-play, endpoint forgiveness, error-type modes, and a fixed seed with independently derived expected outputs. Repeating the same implementation twice is a reproducibility check, not independent correctness evidence.

Before freezing the rules version, benchmark the full four-mode workload and verify a worker result and replay in real browser execution. If a generator change changes outcomes, it is a rules-version change, not an invisible patch.

## Share links and input boundaries

Propose a URL fragment containing a small versioned payload: topic, seed, allowed settings, comparison settings, and optional selected encounter. This avoids server routing requirements and allows browser Back/Forward navigation without a router package. Never encode entire tournament outputs.

Validate decoded types, finite values, forgiveness in [0,1], allowed mode/topic values, and nonnegative weights with a positive total. Normalize editable relative weights explicitly and display their resulting percentages; reject an all-zero mix. Keep zero-weight strategies visible as counterfactual rules with zero population contribution, clearly labelled. These are proposed handling rules, not previously approved controls.

Use a bounded payload size, proposed 8 KiB decoded. Reject unsupported rules versions and attempts to change fixed constants rather than silently replacing them. Render decoded content as text, never HTML. Clipboard failure must leave a selectable link as a fallback.

A link regenerates results in the recipient's browser. It does not provide cross-version backward execution by default. For v1, propose retaining a supported rules version at its deployed release URL or explicitly reporting incompatibility; do not promise perpetual reproducibility across retired versions.

## Interface plan and design workflow

The product is a tool for exploration, not a marketing site. The following describes behaviour and information hierarchy; it does not choose a visual world, theme, or final layout.

1. **Entry and introduction:** explain the premise through the payoff interaction; offer direct entry to the guided topics. Explain both actions without moral judgement.
2. **Guided topic:** one clear question, the relevant approved settings, and an optional prediction. Fixed model bounds are readable facts rather than disabled controls implying editability.
3. **Running:** progress, cancel, and a clear indication of which settings are being evaluated. Changed controls mark existing results as belonging to the previous settings until rerun.
4. **Results:** one plain-language measured finding, primary comparison, supporting metrics, and progressive access to all 100 repetition values. No forced universal winner.
5. **Encounter inspection:** selected pair/repetition, accessible round sequence, and separate intention/action/perception/payoff details. A selected trace illustrates a mechanism rather than proving prevalence.
6. **Interpretation:** model explanation, possible life application, analogy limits, and reproducible sharing.

The length topic is observational; the reward topic is a fixed-incentive walkthrough. Their pages must not imitate interventions that do not exist.

### Using Hallmark and Impeccable together

- The user's request to use both is explicit. Neither may change approved scientific rules to suit a visual concept.
- Hallmark contributes material inventory, visual direction, restrained app-screen styling, coherent tokens, and its rendered design checks.
- Impeccable contributes task flow, information hierarchy, state coverage, accessibility, responsive behaviour, and finish review. Keep its hooks enabled.
- Preserve one approved visual direction and one shared token set. Do not independently stack two themes or run competing redesigns. Reconcile their direction requirements before writing UI code; record any unresolved conflict for the user.
- Before selecting the visual direction, use their supported direction processes and present a reviewable proposal. No palette, typography, logo, screenshots, or generated imagery is selected by this document.
- Build this tool's screens as app screens, not landing-page heroes. Introductory explanatory content remains readable without JavaScript, with an honest notice that simulations require it. Avoid an extra marketing landing page or stock photos.

Material inventory: real content is the agreed rules, strategy behaviours, payoff matrix, and eventually computed encounters. There are no real results, user counts, testimonials, logos, or screenshots yet. The eventual encounter trace can provide the product's distinctive visual material without fabricated proof.

## Milestones and exit checks

| Milestone | Deliverable | Exit evidence |
| --- | --- | --- |
| 1. Approved technical plan | Review this document, resolve material changes, select supported dependency versions | Explicit approval before scaffolding/install |
| 2. Engine foundation | Rules, random streams, tournament, weighting, replay | Deterministic and hand-calculated cases pass; no UI-derived correctness claim |
| 3. Browser execution | Worker integration, validation, progress, cancel, share parser | Browser replay matches engine results; stale/partial results handled |
| 4. Design approval | Hallmark + Impeccable direction and app-screen proposal | User reviews concrete direction before UI implementation |
| 5. Guided experience | All five topics, intro, controls, findings, inspectable traces | Real measured results; no placeholder findings presented as observations |
| 6. Release review | Production build, access checks, measured performance, deployment recipe | Validation report and specific hosting choice before publishing |

Design exploration may run before or alongside the engine only after its own scope is approved. Engine verification remains required before the interface presents findings as measured evidence.

## Proposed validation targets

- Type-check, build, and relevant engine/link tests pass.
- Keyboard operation, visible focus, contrast, reduced motion, screen-reader result announcements, and text alternatives are checked. Use WCAG 2.2 AA as the proposed target; do not claim conformance from an automated scanner alone.
- Inspect 360 px, 768 px, and 1440 px layouts. Test current Chromium and Firefox; Safari/iOS and a physical Android device must either be checked or explicitly reported unverified. Exact available devices are not yet known.
- Initial target: a full four-mode run finishes within 5 seconds on a named test desktop and within 10 seconds on a named representative phone, while controls and cancellation remain usable. These are proposed targets, not benchmarks; no reference device or runtime has been measured yet.
- Exercise invalid links, unsupported versions, all-zero weights, cancellation/restart, rapid changes, empty/failed/running/completed states, and all 100 repetition views.
- Run Hallmark's app-scope rendered checks and Impeccable's relevant checks, then visually inspect the actual render. No screenshots or lint verdicts exist yet.
- Perform the agreed five-beginner test if volunteers are available; disclose its absence otherwise.

## Deployment and privacy

Choose a static host after the local build is reviewable. A provider and domain are not yet selected; no account connection or public deployment is authorized by this plan. Use an HTTPS host capable of serving the built worker asset and versioned static files; verify a shared link from a fresh browser session after publication.

Recommend no analytics, advertising, or remote AI in v1. Simulations need no server calls after assets load, but hosting still receives ordinary page/asset requests and may keep access logs. Do not promise zero data collection by an unselected host. A URL fragment is not secret: the recipient and browser can read it.

No service worker or offline-install promise in v1. Cached assets are not proof of offline reliability.

## Current verification and open approvals

Verified on 1 November 2026: Node v22.23.1 and npm 10.9.8; the approved React/TypeScript/Vite application is installed and builds locally. The installed Impeccable engine runs locally; its hook manifest exists and `hooks status` reports enabled with no disabling environment override. Actual Impeccable hook dispatch was observed on preview and application edits. If Codex presents pending hook trust, the user must review it through `/hooks`; do not bypass it.

The user approved this technical plan and selected the Hands-on Lab visual direction. The local implementation uses the recommended worker architecture, Node test setup, versioned share format, limits, validation, and no-analytics approach. Public hosting is still unselected; physical-device, beginner, and formal accessibility validation remain open as listed in the validation report.

The planning step installed no packages, scaffolded no app, executed no simulation, and performed no deployment. A subsequent design-only step produced and rendered static HTML previews; see [design directions](design-directions.md). Those previews are not React application code or measured tournament results.
