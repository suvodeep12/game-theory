# Product brief

Status: consolidated product scope confirmed in Q54. A proposed [implementation plan](implementation-plan.md) is now available for review; the approved Hands-on Lab implementation now runs locally. See the [rules](simulation-rules.md), [experiments](guided-experiments.md), and [acceptance criteria](acceptance-criteria.md).

## Purpose — agreed

Help people investigate repeated cooperation and conflict, discover conditional patterns, and consider useful applications in their lives. The product must be as honest as possible, including when cooperation loses, strategies tie, or the result changes with the settings.

The ambition is broad curiosity. V1 bounds that ambition to five guided investigations of the repeated prisoner's dilemma. It cannot discover everything about cooperation or human behaviour.

## Audience and starting experience — agreed

No prior understanding of the dilemma or programming is required. The website must work on phones and computers, with no account required.

Visitors can play a short introductory interaction, learn the payoff choices, and continue to experiments. They can also skip the introduction. Familiar terms must be explained where used: a strategy is a rule for choosing an action; a tournament compares those rules across opponents.

Do not equate cooperation with moral goodness or defection with moral badness. Explain their operational meanings in this particular game.

## Experience — agreed

Each guided experiment:

1. States one question in everyday language.
2. Explains the comparison and invites an optional prediction.
3. Runs the comparison and gives a plain-language result.
4. Shows the measures that support the result.
5. Lets visitors rerun it on the same page and adjust approved settings where applicable. Length bounds, error bounds, and payoffs are fixed in v1; not every topic has an intervention control.
6. Provides an inspectable encounter showing the actions behind the scores.
7. Separates an observed result, an explanation within the model, and a possible real-life application.
8. Explains when the real-life analogy breaks.

There is no separate sandbox in v1. Keep each investigation focused; reveal detailed rules and run information on demand.

## V1 scope — agreed

- Repeated prisoner's dilemma only.
- Five guided topics: opponent mix, naturally sampled relationship length, errors, a fixed-incentive walkthrough, and forgiveness/retaliation.
- Six built-in strategies with readable explanations.
- Round-robin comparisons including self-play, initially with equal representation.
- Uniformly random encounter lengths between 200 and 500 rounds, hidden from strategies; bounds fixed in v1.
- Separate action and observation errors, each with a probability independently drawn uniformly from 0–10% once per encounter; bounds fixed in v1.
- Fixed payoffs 3/0/5/1; rewards topic is an explanatory walkthrough, not a changed-payoff experiment.
- Guided error conditions: no errors, action errors only, observation errors only, or both. Enabled types use the fixed 0–10% sampling rule.
- Editable opponent proportions, starting equal; suggested comparison uses 50% Always Defect and 10% for each of the other five strategies.
- Editable forgiveness probability for Generous Tit for Tat, from 0–100%, starting at 10%.
- Individual score, collective score, cooperation rate, and benefit distribution.
- Repeated runs for random experiments and comparisons across changed conditions.
- Reproducible links preserving settings and the randomness seed.
- Useful inconclusive results; no forced universal winner.

## Boundaries — agreed

No accounts, monetisation, public strategy submissions, competitive public leaderboard, custom strategy authoring, or separate sandbox in v1. No additional games, communication, reputation systems, network structure, or evolving populations in the first investigation set.

These boundaries do not prohibit comparing built-in strategies within a result. They exclude a persistent competition between website visitors.

Confirmed after product discovery: React + TypeScript, browser-only simulations, static hosting architecture, both Hallmark and Impeccable for design, and a curious/approachable tone with restrained playfulness. Vite and the Hands-on Lab/Squeeze visual direction were subsequently approved and implemented. A hosting provider and permanent product name remain unselected. Technical proposals are in the implementation plan.

## Future memory — requested, outside v1

Support both remembering the same opponent across encounters and learning/adapting from past outcomes in a later version. Exact identity, retention, learning rules, and evaluation remain undecided. This is simulation-agent memory, not a requirement for visitor accounts or stored personal data.

V1 still permits strategy memory within an encounter, such as Tit for Tat remembering the last observed action. It resets that state between encounters and uses 100 repetitions per condition, comparing average points per move. Do not add a learning framework or persistent opponent identity to v1 in anticipation of this extension.

## Evidence and interpretation — agreed

Every conclusion must identify the conditions and opponents tested. A high average score is different from defeating a particular opponent or improving the population's welfare.

Random action flips and mistaken observations model selected types of error, not the full range of human error. Strategies do not model emotion, intent, learning, negotiation, or the option to leave a relationship.

Real-life discussions are prompts for reflection, not instructions for relationships or claims of validated human behaviour.

## Beginner validation — agreed when volunteers are available

In a small usability check, a complete beginner can:

- Explain why mutual cooperation and unilateral exploitation create a dilemma.
- Run an experiment and distinguish individual from collective success.
- Inspect an encounter and identify a reason for the resulting scores.
- Change a setting and describe whether the finding still holds.
- State at least one limit to applying the finding in life.

If volunteers are available, test with five people unfamiliar with the dilemma. Aim for at least four to independently explain the basic tradeoff, interpret a result, and identify one limitation (Q37). This is an initial comprehension check, not evidence of universal usability. The additional learning outcomes above remain proposed.

Volunteer availability is not a mandatory release blocker. If this check cannot be performed, disclose beginner comprehension as unverified rather than claiming it passed. No time limit has been selected. Traffic and time on site are not substitutes for learning outcomes.

## Decision record

| Interview questions | Decision |
| --- | --- |
| Q1–Q3 | Exploration; beginners included; intellectual honesty required. |
| Q4–Q7 | Skippable introduction; repeated dilemma; conditional evidence; broad curiosity rather than proving cooperation succeeds. |
| Q8–Q11 | Separate findings from analogies; five investigations; multiple metrics; built-in strategies. |
| Q12–Q16 | Guided pages without a separate sandbox; round robin with self-play; encounter inspection; separate error types; public website. |
| Q17–Q21 | Adjustable guided experiments; six strategies; 3/0/5/1 payoffs; reproducible links; qualified life discussions. |
| Q22–Q26 | Random encounter lengths requested; uncertain-ending comparison; independent symmetric errors by default; inconclusive results allowed; no monetisation/accounts/submissions/leaderboard. |
| Q27–Q30 | User selected a 200–500 range instead of 180–220; accepted matched randomness, precise forgiveness/WSLS rules, and drafting these docs. |
| Q31 and memory clarification | Agreed for v1: 100 repetitions, reset strategy state between encounters, average points per move. Future extension must include both opponent memory across encounters and learning/adaptation. |
| Q32–Q33 | Opponent mix represents encounter frequencies, not reproduction/evolution. WSLS receives true earned payoffs despite mistaken action observations; explain the resulting information advantage. |
| Q34–Q37 | Agreed encounter-normalized, opponent-weighted scores and averaging both self-play roles; descriptive averages/variation/benefit distribution without significance claims. Q36 replaces the earlier fixed-versus-uncertain proposal: all v1 length conditions are bounded random. Beginner test: five volunteers, aim for four successful, when people are available. |
| Q38–Q41 | Rejected short/baseline/long length presets: lengths should be completely random within bounds. Requested random bounded errors; sampling level and bounds remain open. Rejected the proposed T-only payoff control and 3.5–5.5 range; replacement remains open. Simultaneous decisions agreed. |
| Q42–Q44 | Lengths are independently uniform integers in 200–500; bounds are not visitor-editable in v1. Error probabilities are drawn separately for action and observation errors once per encounter, then held for that encounter; default bounds remain open. Q44 rejected its payoff proposal; the intended replacement still needs clarification. |
| Q45–Q47 | Fixed payoffs 3/0/5/1. Each error probability drawn uniformly from 0–10% per encounter, bounds fixed in v1. Length topic describes naturally sampled variation rather than changing duration. Supersedes earlier unresolved payoff and error-bound notes. |
| Q48–Q51 | Rewards retained as a fixed-incentive walkthrough. Error comparisons may enable neither, either, or both error types. Opponent proportions editable from equal shares; suggested comparison 50% Always Defect, others 10% each. Forgiveness editable 0–100%, starting at 10%. |
| Q52–Q53 | Reporting contract accepted: means, all 100 repetition values available, population-weighted collective measures, benefit gap, neutral reproducible trace selection, no significance claims. Schedule accepted: 21 unordered pair/self-play encounters per repetition, no reverse duplicates. |
| Q54 | Consolidated scope confirmed; proceed to a documented implementation plan before coding. |
| Technical/design clarification | React + TypeScript; browser-only simulations served as static files; curious/approachable tone with restrained playfulness. User explicitly requests both Hallmark and Impeccable. |

## Product discovery checkpoint

The product/model decision frontier was settled through Q53 and the consolidated scope confirmed in Q54. Initial stack/runtime/tone choices are recorded above. The next review is the implementation plan, not a reopening of product discovery. No scaffolding, installation, or publishing has been authorized yet.

Product control ranges are settled. Widget behaviour, zero-weight handling, performance limits, accessibility validation, random-generator/version choices, and link compatibility belong to a subsequent implementation plan; none is implicitly approved here. No need to select a stack or add implementation flexibility during product discovery.
