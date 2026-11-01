# Simulation rules

Status: agreed v1 model, implemented and checked locally. See [validation](validation.md) for evidence and remaining limits. This does not establish predictions about human behaviour.

## Vocabulary

- **Action:** cooperate (C) or defect (D).
- **Round:** both players choose simultaneously, then receive payoffs.
- **Encounter:** repeated rounds between two independent strategy instances.
- **Tournament:** encounters between the selected strategies, including self-play.
- **Repetition:** another tournament with fresh random events and strategy state.
- **Condition:** one fully specified combination of strategies, population mix, payoffs, length rule, and error settings.
- **Experiment:** a comparison between conditions answering one guided question.

**Agreed (Q41):** actions are simultaneous; neither player sees the other's current choice before choosing. Feedback arrives afterward.

## Payoffs — agreed

| Actual actions | First player's points | Second player's points |
| --- | ---: | ---: |
| C, C | 3 | 3 |
| C, D | 0 | 5 |
| D, C | 5 | 0 |
| D, D | 1 | 1 |

Use R for mutual cooperation, T for successful exploitation, P for mutual defection, and S for being exploited. **Fixed in v1 (Q45):** R=3, T=5, P=1, S=0. No payoff editor or randomized payoffs.

These constants satisfy T > R > P > S and 2R > T+S. The former gives the dilemma's incentive ordering; the latter makes sustained mutual cooperation outperform alternating exploitation in combined score. Verify the constants in engine checks; shared links must not override them.

## Strategies — agreed

| Strategy | Intended first action | Intended action afterward |
| --- | --- | --- |
| Always Cooperate | C | C |
| Always Defect | D | D |
| Tit for Tat | C | Copy the opponent's previously observed action. |
| Grim Trigger | C | D forever after any observed opponent defection; otherwise C. |
| Generous Tit for Tat | C | C after observed C; after observed D, choose C with probability 0.10, otherwise D. |
| Win-Stay, Lose-Shift | C | Repeat own previous actual action after R or T; switch it after S or P. |

**Agreed control (Q51):** the forgiveness investigation lets visitors vary this probability from 0 to 1 (0–100%), starting at 0.10. At probability 0 this strategy behaves like Tit for Tat; at probability 1 it always intends to cooperate. Errors may still alter executed actions.

WSLS treats R/T (3 or 5 points) as favourable and S/P (0 or 1) as unfavourable. It knows its previous actual action, as agreed in the error rules. Payoff editing is outside v1.

Strategies have no advance knowledge of the final round. In v1 they are fixed rules, not learning agents. Reset their state between encounters (agreed in Q31); within-encounter memory remains part of their definitions. A future version is requested to support both remembering the same opponent across encounters and learning/adapting from past outcomes. Its mechanics are not yet defined.

## Tournament and opponent composition

**Agreed:** every selected strategy meets every other selected strategy and itself; equal representation is the starting condition. Self-play means two independent instances, not a strategy seeing its own hidden state or sharing its random decisions.

**Agreed schedule (Q53):** run each unordered pair once per repetition, including one self-pair. Six strategies therefore produce 21 encounters, or 2,100 encounters across 100 repetitions per condition. Each encounter supplies both players' scores; average the two self-play roles as specified below. No reverse-order duplicate encounters are required because choices are simultaneous.

**Agreed aggregation (Q34):** calculate each strategy's mean score against each opponent type, averaging the two self-play roles within that cell. Weight opponent cells by encounter frequency; at baseline, average the six cells equally. A self-pair must not receive double weight just because it supplies two player records.

**Agreed interpretation and weighting (Q32, Q34, Q52):** opponent mix means encounter frequencies, not reproduction or evolution. Explicit opponent-frequency weights w_j sum to 1. A focal strategy's expected score is the sum of w_j times its score against opponent j. Population outcomes also weight focal strategies by w_i. This describes encounters in a well-mixed population, not a finite set of agents.

**Agreed controls (Q50):** visitors can edit opponent proportions, starting with equal shares. Suggested guided comparison: Always Defect has weight 0.50 and each other strategy 0.10. Widget mechanics and invalid/zero-weight handling will be specified during implementation planning; the mix must remain a valid probability distribution.

## Encounter length

**Agreed (Q42, Q47):** independently draw each encounter's length uniformly from integers 200–500 inclusive; mean 350. Lengths are hidden from strategies. Visitors cannot change the bounds. No duration presets, fixed-length conditions, or geometric stopping in v1.

The length investigation describes differences among naturally sampled lengths. It does not manipulate duration or prove a causal effect. Compare like strategy pairs and disclose differing error rates; a pooled association can be misleading. Exact descriptive displays remain to be designed.

**Scientific limit:** a hidden bounded horizon still has a guaranteed last possible round. The current strategies do not use remaining-time estimates, so comparisons measure duration and truncation effects on fixed behaviours, not strategic responses to knowing an ending is near.

**Execution safeguard:** validate finite integer bounds and enforce a documented computation budget. A run stopped for safety must be labelled incomplete; never silently change the selected length distribution.

## Errors — agreed

Action-error and observation-error probabilities are separate. Both players use the same encounter-level rates; conditional on those rates, individual flips are independent across players and rounds.

Per round:

1. Both strategies choose intended actions from their available previous information.
2. Each player's action independently flips C↔D with the action-error probability.
3. Payoffs are assigned from those actual actions.
4. Each player's observation of the opponent's actual action independently flips C↔D with the observation-error probability.
5. Each strategy records its own actual action and its perceived opponent action for the next round.

The visitor can inspect intentions, actual actions, observations, and payoffs. The strategy must not receive the visitor's privileged view.

**Agreed (Q33):** retain true payoff feedback for WSLS even when its action observation is wrong. Its payoff can reveal the opponent's actual action, so explain that observation errors affect these strategies differently. The other strategies continue using the inputs specified in their rules; they do not acquire WSLS's payoff-based decision rule.

**Agreed sampling (Q43, Q46):** independently draw action-error and observation-error probabilities uniformly from 0 to 0.10 once per encounter, then hold them throughout that encounter. Bounds are fixed in v1, not visitor-editable. Both players use the same drawn rates; individual flips are independent conditional on those rates. Across the whole tournament, shared encounter rates create dependence, so do not describe all errors as unconditionally independent.

**Agreed comparison modes (Q49):** no errors, action errors only, observation errors only, or both. Disabled types have probability exactly zero; enabled types use the per-encounter uniform 0–10% draw. Keep underlying rates and event draws aligned when matching conditions, including when a type is disabled. These random flips model selected error mechanisms, not the full range of human mistakes.

## Repetitions and matched randomness

**Agreed for v1 (Q31, Q34):** 100 tournament repetitions per condition, fresh strategy state per encounter, and comparison by encounter-average points per move, weighted by opponent mix. This is a starting computation budget, not a guarantee of statistical precision.

**Agreed:** compare conditions using matched encounter lengths and underlying random draws wherever possible.

**Implemented randomness contract:** rules version 1 pins cyrb128 seed expansion and sfc32 streams. Keys include rules version, seed, repetition, canonical strategy pair, and event type/player role. Integer lengths use rejection sampling to avoid modulo bias over 301 lengths. Per-event streams advance once each round regardless of a strategy's branch, so extra forgiveness decisions never shift error draws. Self-play roles have independent action, observation, and forgiveness streams.

Where a setting changes a probability, use the same underlying uniform draw and compare it with each condition's threshold. Keep encounter lengths matched between v1 conditions; their distribution is fixed. Matching reduces incidental variation; it does not remove dependence within encounters or across paired conditions.

Share links must preserve every result-affecting setting, seed, and a version identifying the simulation rules. Unsupported versions or invalid settings must fail visibly rather than silently running a different experiment. URL format, generator choice, and compatibility policy are open technology decisions.

## Metrics

**Agreed:** show individual performance, collective performance, cooperation, and distribution of benefits.

**Agreed definitions (Q34, Q52):**

- Individual performance: mean earned points per player-round, with opponent weighting explicitly defined above. Do not rank by raw total when encounter lengths differ.
- Collective performance: expected points per player-round across the selected population. If displaying combined points per two-player round, label the different units.
- Cooperation: fraction of actual actions that are C, using the same population/encounter weighting as the stated result. Intentions are available in the encounter trace, not substituted for actual cooperation.
- Benefit distribution: per-strategy score distribution and highest-minus-lowest mean score. This describes strategy outcomes, not inequality among individual humans.

**Agreed encounter scoring (Q34):** for fixed opponents, encounter score = total points / rounds. Average encounter scores over repetitions, then apply opponent weights. This estimates the outcome of a randomly drawn encounter, not a randomly drawn round pooled across all encounters. Label this distinction; the two differ for variable durations.

For comparisons, report paired differences between repetitions alongside their variation. Do not treat individual rounds as independent samples: the strategies react to earlier rounds.

**Agreed reporting (Q35, Q52):** show average scores, variation across the 100 repetitions, and distribution of benefits across strategies. Make no statistical-significance claims in v1 and introduce no significance threshold. If repetitions are identical, zero observed variation does not prove robustness to other settings.

**Agreed reporting contract (Q52):** show the arithmetic mean with access to all 100 repetition values, plus paired differences for condition comparisons. Show per-strategy means and their highest-minus-lowest gap as a simple benefit-distribution summary. Collective score and cooperation use the same encounter averaging and opponent/population weights described above. Call the highest mean exactly that, never a statistically proven winner. Show changing rank order and exact ties directly, without inventing a significance cutoff. Select an illustrative trace reproducibly without searching for a preferred outcome; allow other strategy pairs and repetitions to be inspected. None of these displays substitutes for testing other settings or seeds.

## Interpretation and sources

Always distinguish success against a particular opponent, tournament score, collective benefit, and robustness across tested conditions. No one measure establishes a universal best strategy.

[Axelrod (1980)](https://esp.mit.edu/download/2dd80247-be60-4e73-b49d-91b5b6988ff0/S12850_axelrod_1980.pdf) supplies historical context for repeated-game tournaments. [Glynatsi, Knight and Harper](https://arxiv.org/abs/2001.05911) investigate performance across many strategies and settings. These sources motivate conditional reporting; they do not establish results for this app's selected rules.
