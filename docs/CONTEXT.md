# Project context — start here

Updated 1 November 2026. This tracked index and the linked records are the project handoff, not an approval certificate. The user explicitly requires project context to remain in the repository. Future changes must update these records rather than rely on chat history.

## Purpose and audience

A curiosity experiment for everyone, including people unfamiliar with the prisoner's dilemma. Run simulations and tournaments, inspect what happened, discover conditional conclusions, and consider cautious life applications. The app must be honest: no assumed victory for nice strategies, no universal winner or validated prediction about people. The initial inspiration is [the user's video](https://www.youtube.com/watch?v=mScpHTIi-kM); its full transcript was not verified. “Game Theory” is a working name.

## Authoritative records

| Subject | Record |
| --- | --- |
| Original scope and discovery decisions | [Product brief](product-brief.md), [PRODUCT.md](../PRODUCT.md) |
| Fixed model, strategies, payoffs, randomness and error rules | [Simulation rules](simulation-rules.md), [engine](../src/engine.ts) |
| Five guided questions | [Guided experiments](guided-experiments.md) |
| Acceptance requirements | [Acceptance criteria](acceptance-criteria.md) |
| Architecture and original milestones | [Implementation plan](implementation-plan.md) |
| Current avatar and cumulative-score definitions | [Score presentation](score-presentation.md) |
| Design system and current reading order | [DESIGN.md](../DESIGN.md), [surface contract](hands-on-contract.md) |
| Design alternatives and feedback history | [Design directions](design-directions.md), [revision history](design/HISTORY.md) |
| Avatar source, production asset and exact prompts | [Avatar notes](design/avatars/README.md), [v2 provenance](design/avatars/v2-provenance.md) |
| Verified checks and remaining limits | [Validation](validation.md), [browser evidence](verification/avatar-scores-browser.json) |
| Current rendered evidence | [Desktop scores](design/current/scores-desktop.png), [phone scores](design/current/scores-phone.png), [encounter](design/current/encounter-desktop.png) |
| Contributor instructions and context maintenance | [AGENTS.md](../AGENTS.md) |

## Confirmed constraints

- React + TypeScript; simulations run entirely in the visitor's browser. Vite builds static files; no backend, accounts, analytics, or result uploads.
- Browser Web Worker runs seeded jobs. No partial tournament is labelled completed. Cancellation, failure, invalid links, and stale results are explicit.
- Six fixed strategies; simultaneous choices; payoffs CC 3/3, CD 0/5, DC 5/0, DD 1/1. Each pair and self-pair plays once per repetition: 21 encounters, 100 repetitions per situation.
- Each encounter independently samples a uniform integer duration from 200 through 500, hidden from strategies. V1 duration bounds, payoff matrix and error bounds cannot be edited.
- Enabled action and observation probabilities are sampled independently and uniformly from 0 to 10% once per encounter; both players use those rates with independent flips. Mistakes belong in the model.
- Strategy state resets between encounters. Future memory means both remembering opponents across encounters and learning/adaptation; neither is implemented in v1.
- Forgiveness is adjustable for Generous Tit for Tat. Opponent weights affect weighted aggregation; they do not alter the fixed encounter schedule.
- Seeded rules version 1 and event-separated random streams reproduce encounters and match comparisons. Unsupported links fail rather than adopt different rules.
- No separate sandbox in v1. All five investigations remain available. Rules and detailed evidence use progressive disclosure.

## User feedback and latest decisions

1. User approved the Hands-on Lab direction after three previews, using Hallmark + Impeccable, with a curious, approachable tone and restrained playfulness.
2. The first implementation passed technical checks, but the user found it extremely confusing, specifically the experiment and results. Technical checks did not establish usability.
3. First simplification exposed one run action, collapsed advanced controls/evidence, and led with cooperation percentages. The user still found it confusing.
4. The user proposed avatars for players/strategies and required them to be distinct and instantly recognizable. A six-character cast sheet was generated and kept as historical concept 1.
5. The user required nice and nasty strategies to look distinct, then defined nice as “never defects first.” The discussed classification is in error-free play: Always Defect is nasty; the other five are nice. Nice does not mean forgiving; Grim Trigger remains nice. Errors can change actual and subsequent actions. The new artwork uses five rounded silhouettes and one angular berry-red silhouette.
6. The user requested visible points on the actual screen, then identified the most valuable stat as “the score after n number of rounds.” When asked, they chose the **whole tournament**, then **N rounds across all games**, rather than equal N rounds per strategy. This supersedes cooperation percentages and average points as the primary readout; those remain secondary.
7. The user requested the project on their GitHub as a public repository: [suvodeep12/game-theory](https://github.com/suvodeep12/game-theory). The initial push was verified. Publishing a repository is not public website hosting.
8. The user requires the entire project context to remain in the repository. This index, the contributor rule, and linked evidence implement that requirement.

## Current implementation

The intro is playable/skippable. Each guided question has a short explanation and run action. Completed results show six persistent avatars with raw accumulated points and rounds played at global tournament round N. A slider and number field select N; the final score is the default. Nice/nasty labels are explicit and qualified. Cooperation, weighted means/ranges, all repetition values, strategy rules, and encounter replay remain inspectable. An encounter shows separate player totals through its selected round, including explicit player 1/player 2 labels for self-play.

Raw totals use actual scheduled games and count both roles in self-play. Games are traversed in repetition order and then the fixed pair order. One global round contains two player actions. Unequal playing time and schedule order affect raw standings. Changing only opponent weights leaves raw totals unchanged; the weighted measures retain the original population-mix interpretation. These distinctions are visible in the UI and detailed in the score-presentation record.

## Verification and limitations

Thirteen built-in Node tests and production type-check/build pass for the avatar/score change. Headless Edge checks match raw totals to independent summation, check round zero and a partial first game, count both self-play roles, confirm encounter totals, six distinct sprite positions, actual alpha transparency and ring opening, and no page overflow at 360/768/1440 pixels. Current screenshots are tracked. Exact evidence is linked above.

No physical-device test, formal accessibility certification, beginner recognition/comprehension study, Firefox/Safari coverage, or independent finish review of this latest revision has established usability. The earlier reviewers assessed previous layouts. Original final scoring calls hit an agent usage limit; local scoring was disclosed. The revised artwork is implemented following the user's direction; it has not received a separate explicit aesthetic approval.

The tournament cursor N is local view state, not encoded in the shared link; sharing regenerates the experiment's final scores and stored encounter selection. There is no public web host/domain, adaptive strategy memory, live human participation, evolution, statistical significance test, or validated real-life prediction. Do not silently expand scope to fill these gaps.

## Next work

- Get the user's feedback on the avatar identities, main cumulative scoreboard, and clarity of N.
- If volunteers are available, run the planned five-beginner comprehension check (aim for four successful completions), including avatar recognition and point-unit understanding. Record failures rather than infer success from screenshots.
- Discuss whether future opponent-mix experiments should change actual fixture frequencies; this requires an explicit model decision, not a cosmetic scoring change.
- Select public website hosting only when requested. Keep context and evidence current in every subsequent change.
