# V1 acceptance criteria

Status: v1 requirements. Local implementation and model/browser checks are recorded in [validation](validation.md); do not interpret every requirement below as independently passed, especially physical-device and full accessibility checks. Product scope and the technical/design plan were approved before implementation.

## Beginner experience

- A visitor unfamiliar with the dilemma can learn both actions and all four payoff outcomes through a short, skippable interaction.
- All five investigations explain their question before showing controls or results.
- Visitors can edit opponent proportions, forgiveness, and error-type modes where relevant, and rerun on the guided page. Length/error bounds and payoffs remain fixed; there is no separate sandbox.
- Strategy names have behavioural explanations available in context.
- Findings distinguish individual success, collective benefit, cooperation, and benefit distribution.
- Every investigation includes an inspectable encounter and qualified real-life discussion.
- When volunteers are available, test five beginners and aim for at least four to independently explain the tradeoff, interpret a result, and identify a limitation. If no volunteers are available, disclose that comprehension is unverified; do not treat this as a mandatory release blocker.

## Model correctness

Use small deterministic reference cases, not only broad end-to-end screenshots:

| Case | Expected check |
| --- | --- |
| Every actual action pair | Exact payoff matrix, including both player perspectives. |
| Always Cooperate vs itself, no errors | Both always cooperate and earn 3 per round. |
| Always Defect vs itself, no errors | Both always defect and earn 1 per round. |
| Always Cooperate vs Always Defect | Scores are 0 and 5 per round respectively. |
| Tit for Tat vs Always Defect | First actions C/D, then D/D; first-round loss included. |
| Grim Trigger after perceived D | It continues intending D for the rest of that encounter only. |
| Generous Tit for Tat | Controlled draws below/above the threshold produce forgiveness/retaliation; endpoints 0 and 1 behave correctly. |
| WSLS | Repeat after R/T, switch after S/P, using previous actual action and the fixed 3/0/5/1 payoffs. |
| Error probability 0 | No flips. |
| Error probability 1 in engine checks | Every applicable action or observation flips, with scoring based on actual actions. |
| Separate observation histories | A mistaken observation changes only that observer's future information; no access to opponent intention. |
| Self-play | Independent state and random decisions for each player role. |
| New encounter | No inherited history, trigger state, or previous payoff. |
| Schedule | Six strategies produce 21 unordered pair/self-play encounters per repetition and 2,100 per condition; no reverse duplicates. |
| Bounded lengths | Integer lengths within 200–500 inclusive; controlled sampling verifies both boundaries. |
| Length conditions | Every v1 condition uses its selected bounded random range; invalid bounds are rejected. |
| Fixed v1 settings | Links cannot override length bounds 200–500, error bounds 0–10%, or payoffs 3/0/5/1. |
| Sampled error rates | Independent controlled draws select the two rates in 0–10%; both remain constant throughout their encounter. |
| Error-type modes | Disabled types have exactly zero probability; all four combinations work and preserve matched draws. |
| Agreed controls | Equal-share and 50%/10%-each opponent mixes are valid; forgiveness is bounded to 0–100%, default 10%. |

Verify that WSLS receives its true earned payoff under observation errors, while observation-based strategies still act on their perceived histories (agreed in Q33).

## Comparison integrity

- A condition's complete settings and strategy rules can be inspected.
- Shared links reproduce computed metrics and encounter traces under the same supported rules version.
- Seed, settings, strategy definitions, and any implementation change affecting results are versioned together.
- Invalid or unsupported links show a clear error rather than silently using defaults.
- Pair identities and event types keep matched random draws aligned when strategy behaviour changes.
- Reordering the strategy display does not change the experiment's random events or substantive results.
- Scores are normalized and weighted according to the approved definitions. Verify self-play is not accidentally double-weighted.
- For variable lengths, a hand-calculated case distinguishes average encounter scores from pooled round scores and confirms the chosen definition.
- Population weights sum to 1; zero weights and invalid mixes must have specified behaviour in the implementation plan.
- Repetition distributions use tournament repetitions as sampling units, not supposedly independent reactive rounds.
- Identical seeds reproduce outputs; random seeds do not replace testing across settings.

## Honest reporting

- "No clear winner" and changes in ordering are supported outcomes.
- Observed variation is shown in a digestible form, with details available.
- All 100 repetition values are accessible; means, population weighting, benefit gaps, and paired condition differences match hand-calculated reference cases.
- No unapproved significance threshold is used to generate winner claims.
- Robustness claims name the conditions actually evaluated.
- An illustrative encounter is labelled as one encounter, not representative proof.
- All v1 length conditions are bounded random; no fixed-length or geometric mode is introduced.
- Length results disclose the strategies' lack of endgame reasoning.
- The rewards walkthrough explains fixed incentives without claiming evidence about changing payoffs.
- Error results disclose the information available to each strategy.
- No practical takeaway is presented as a validated prediction about human relationships.

## Access, operation, and scope

The following are proposed validation requirements, not completed checks:

- Core flows work on a phone-sized viewport and a desktop viewport.
- Controls and encounter inspection are keyboard operable, visibly labelled, and understandable without colour alone.
- Results have a readable text/table alternative to visual summaries; updates are accessible to assistive technology.
- Long runs show progress and can be cancelled without leaving stale results presented as current.
- Input bounds and computation budgets prevent an accidental unbounded run; exact limits require agreement.
- Partial, failed, and cancelled experiments are not presented as completed comparisons.
- No account or persistent public leaderboard is required; no submissions or monetisation flows are introduced.

Performance targets, browser/device matrix, accessibility audit procedure, hosting, and privacy/analytics choices remain open. Do not claim these pass based on a build alone.

## Gate to implementation

1. Review this discovery draft and settle the remaining decision frontier.
2. Confirm shared understanding of the product and scientific limits.
3. Select the smallest suitable implementation approach and agree concrete limits and verification targets.
4. Implement and validate the simulation rules before publishing results as findings.

Writing these documents does not clear any of these gates.
