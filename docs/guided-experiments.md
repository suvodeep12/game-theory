# Guided experiments

Latest presentation decision: cumulative points at global round N is the primary readout, with recognizable strategy avatars. The weighted comparisons and cooperation measures below remain secondary evidence. Opponent weights affect aggregation rather than the fixed game schedule; raw cumulative totals do not change solely with weights. See [score definitions](score-presentation.md) and [current context](CONTEXT.md).

Status: five topics, controls, and reporting contract agreed through Q53 and implemented in the selected Hands-on Lab interface. Findings are computed at runtime from actual seeded simulations; examples and wording here describe the reporting contract, not predetermined outcomes. See [validation](validation.md).

## Shared presentation

Start with one question. Where there is an approved experimental control, compare clearly labelled conditions. The length page instead explores naturally sampled variation; the rewards page explains the fixed incentives. Make predictions optional and accept any prediction without judgement. Run the investigation, state what happened, then let visitors inspect the evidence and change only approved settings.

Show a short readable finding before detailed charts or tables. Explain points and uncertainty in ordinary language. Keep settings, definitions, repetition count, seed, and rules version available without dominating the first view.

Every result distinguishes:

1. **Observed:** what this run measured, under which settings.
2. **Model explanation:** which interactions plausibly account for the measurement, supported by an encounter trace.
3. **Possible life application:** a question or qualified analogy.
4. **Where it breaks:** missing features of human situations.

Explain that one selected encounter illustrates a mechanism; it does not establish how frequent that mechanism is. Agreed in Q52: show a reproducibly selected encounter without choosing it because it supports a preferred story, and let visitors select other pairs and repetitions.

## 1. Who you encounter

**Question:** Does a strategy's success depend on who it meets?

**Agreed comparison (Q50):** equal shares versus 50% Always Defect and 10% each for the other five strategies. Keep other settings matched. Visitors may edit opponent proportions.

**Relevant control:** opponent mix, expressed as encounter chances rather than unexplained weights.

**Evidence:** per-strategy scores, population score, cooperation, and encounters with different opponent types. Explain that population averages change both because encounters change and because the mix being averaged changes.

**Possible application:** consider how repeated exposure to different behaviours changes the value of a response.

**Limit:** real people adapt and choose relationships; these agents neither learn nor leave. This experiment is not evolutionary survival and does not show that a strategy will spread.

## 2. How long interactions last

**Question:** What differences do we observe among shorter and longer encounters in these runs?

**Agreed format (Q42, Q47):** describe naturally sampled lengths, independently uniform in 200–500. Visitors cannot edit bounds. No fixed-length, alternative-range, or geometric-ending comparisons in v1. This is a descriptive investigation, not a controlled intervention on duration.

**Evidence:** points per move, actual length distribution, and traces showing early actions and later patterns.

**Possible application:** repeated contact can change the accumulated consequences of a fixed response.

**Limit:** these six rules do not anticipate the ending. A null result may show that their long-run patterns are already stable, not that uncertainty never matters. Compare within strategy pairs and disclose sampled error rates rather than attributing every score difference to length. Do not present this as a test of human endgame reasoning or a causal duration experiment.

## 3. Mistakes and misunderstanding

**Question:** Can a small mistake cause lasting conflict?

**Agreed error model (Q43, Q46):** independently sample each enabled error type's probability uniformly from 0–10% once per encounter, holding it for the encounter. Bounds are fixed in v1. A disabled error type has probability exactly zero.

**Agreed conditions (Q49):** no errors, action errors only, observation errors only, and both. No editable rates or bounds. Compare conditions with matched randomness; introduce error mechanisms separately before combining them.

**Evidence:** cooperation, score changes, variation across repetitions, and an inspectable trace separating intention, execution, and perception. Include access to a trace with no persistent conflict if the outcome varies.

**Possible application:** a response to an apparent slight can amplify a misunderstanding; clarification may matter in life.

**Limit:** clarification is not available to these strategies. Independent random errors are not a complete model of human mistakes. Under the agreed rule, true payoff feedback can reveal actions to WSLS even when its action observation is mistaken; explain that information advantage.

## 4. Rewards and penalties

**Agreed restriction (Q45):** fixed payoffs 3/0/5/1, with no editor or randomization. The originally proposed changed-incentive experiment is outside these rules.

**Agreed format (Q48):** a guided walkthrough of how the fixed incentive structure produces the dilemma, supported by actual encounter scores. Do not present fixed-payoff runs as evidence about changing incentives.

**Relevant control:** none for payoffs in v1.

**Evidence:** the payoff matrix and actual encounters showing immediate gains and accumulated consequences. No claims about untested payoff conditions.

**Possible application:** incentives can reward behaviours that reduce mutual benefit.

**Limit:** incentives are held constant. This cannot establish how strategy rankings or humans respond to changed rewards.

## 5. Retaliation and forgiveness

**Question:** When does forgiving a defection help, and when does it expose a strategy to exploitation?

**Proposed comparison:** compare Tit for Tat, Grim Trigger, and Generous Tit for Tat within the same population; vary only the generous strategy's forgiveness probability between conditions. Include both an error-free context and a context with errors, clearly separated.

**Agreed control (Q51):** probability of forgiving an observed defection, adjustable from 0–100%, starting at 10%. Compare a visitor-selected value with the baseline using matched randomness; no additional preset probabilities are required.

**Evidence:** score, cooperation, benefit distribution, and recovery or continued conflict visible in encounter traces. Do not add a new quantitative recovery metric without defining it first.

**Possible application:** responses that permit recovery can preserve mutual benefit, but repeated unconditional concessions can be exploited.

**Limit:** forgiveness here is a random action rule, not trust repair, accountability, remorse, or an obligation to remain in a harmful situation.

## Result wording

Proposed templates, populated only from computed evidence:

- "Under these settings, [strategy] earned [value] points per move on average."
- "Changing [setting] changed [metric] by [difference] across these matched runs."
- "The ordering varied across repetitions; this experiment does not establish a clear winner."
- "This held in [named tested conditions]. Other conditions were not tested."

Do not hard-code an experiment's expected lesson as its observed result. A reproducible seed reproduces a sample; it does not validate the model or establish a general conclusion.
