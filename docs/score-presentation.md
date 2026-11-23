# Avatar identity and score presentation

Confirmed by the user on 1 November 2026. This adds a presentation view over rules version 1; it does not change the simulated games.

> **Historical since 23 November 2026.** The cumulative-score lab was replaced by the evolution grid ([CONTEXT](CONTEXT.md), decision 10). The nice/nasty identity rules below still apply to the grid's avatars and cell shapes; the N-round scoreboard and its code no longer ship. Recover `src/scores.ts` and `tests/scores.test.ts` from commit `d19cc22` if needed.

## Nice and nasty

The user's definition: **nice means never defects first**. The design discussion qualifies this classification to error-free play. Always Cooperate, Tit for Tat, Grim Trigger, Generous Tit for Tat and Win-Stay, Lose-Shift receive distinct rounded characters. Always Defect receives an angular berry-red character. Nice describes initiation, not forgiveness, guaranteed cooperation under errors, moral worth, or superior results. In particular, Grim Trigger retaliates permanently within an encounter after a perceived defection; Win-Stay, Lose-Shift can sustain a mistaken defection after a rewarding payoff.

The same identity follows a strategy across result scores, rule explanations and encounter traces. Text labels remain present; colour and faces do not carry essential meaning alone. Both self-play instances share an identity and receive explicit player-number labels.

## Primary metric: points after N rounds across all games

The user chose the whole tournament and then chose **N rounds across all games**, rather than equal N rounds per strategy.

For each selected situation, concatenate its 2,100 encounters in the existing order: repetition 0 through 99, and within each repetition the fixed unordered/self-pair sequence in `PAIRS`. A round is one simultaneous pair of actions within one encounter. The global cursor N ranges from zero through the sum of all encounter durations. The default is the final round. This is a completed-tournament replay view, not live partial-worker output.

At cursor N, add actual earned points for every completed round to the appropriate strategy. If a game crosses the cursor, replay that exact seeded encounter and sum only its first required rounds. All earlier games use their already-computed totals. Count both players in self-play: one self-play round contributes two player-rounds and both earned payoffs to the strategy's displayed total. Summed rounds played across all six strategies equal 2N.

Every avatar shows its raw points and its own rounds played. A score of zero at N=0 means no games have been counted. The number input and range select the same cursor. Selecting a different situation resets to that situation's final totals.

## Interpretation boundary

These are raw scheduled-game totals. They differ from the original weighted average points per move: no opponent or focal population weights are applied and self-play roles are summed rather than averaged. Different encounter lengths and partial scheduling mean strategies can have different playing time. A higher raw score alone is not proof of a better strategy. Compare rounds played and inspect normalized results when appropriate.

The model always simulates the same pair schedule. Opponent-mix weights change aggregation, not actual game frequencies. Consequently two conditions differing only in weights have identical raw totals at N; their weighted averages can differ. This is a disclosed limitation, not an engine bug to hide or a reason to silently change the approved model.

Cooperation percentages, weighted means, observed ranges, paired differences, full repetition values, and exact encounter replay remain available as secondary evidence. Encounter totals count that encounter's points through its selected round; they are not the global tournament totals. Shared experiment links currently regenerate final raw totals; they do not save the global cursor N.

## Implementation and checks

`src/scores.ts` (removed; see commit `d19cc22`) computed deterministic sums using summaries plus at most one boundary replay. Its tests covered zero, a partial self-game, the next game's partial score, final totals, both self-play roles, 2N player-rounds, and invalid cursor values. [Browser evidence](verification/avatar-scores-browser.json) verified actual rendering against independent sums. [Lab screenshots](design/history/lab-scores-desktop.png) show that design. These checks establish arithmetic and rendering behaviour, not beginner comprehension or real-life validity.
