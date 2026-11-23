# Design history and feedback

These are historical proposals and evidence. Current authority is [DESIGN.md](../../DESIGN.md), the [simulation rules](../simulation-rules.md), and the current source; the [surface contract](../hands-on-contract.md) describes the retired lab. A past technical or design review is not evidence that the current interface is understood by beginners.

## Initial direction — 1 November 2026

The user asked for Hallmark and Impeccable together, React + TypeScript, browser-only simulations, and a curious, approachable tone with restrained playfulness. Hallmark's Squeeze world supplied forest green, pale encounter surfaces, peach actions, Gabarito and Manrope. Static alternatives were reviewed: [Field Guide](history/field-guide.html), [Hands-on Lab](history/hands-on.html), [Comparison Board](history/comparison-board.html), and a [conventional baseline](history/canon.html). The user selected Hands-on Lab after a recommendation.

The initial working app exposed a round trace, error modes, optional predictions, controls, rankings, shared outcomes, variation, and a detailed inspector. Model/build/browser checks passed. Fresh reviewers identified missing mobile scroll hints/caption wrapping and the disappearing opening illustration; those were fixed. Final Hallmark scoring of one row-pinning fix became unavailable due to an agent usage limit and was verified locally. See the archived review reports in this directory's `history` folder.

## First usability revision

The user said the entire working app was extremely confusing, then identified the experiment and results. The UI was reduced to a question selector, explanation and primary run action. Optional settings and evidence were collapsed; the opening trace became optional. Results led with cooperation percentages rather than detailed rankings. The user still found it very confusing. This rejected outcome is important: hiding tables and shortening copy did not establish comprehension.

## Player identities and cumulative points

The user proposed avatars tied to specific strategies and required distinct, instantly recognizable identities. [Cast concept 1](avatars/cast-v1.png) gave six different silhouettes. The user then required nice strategies to look distinctly different from nasty strategies, defining nice as “never defects first.” Five rounded identities and an angular Always Defect identity were generated as the [production atlas](../../public/avatars/strategies-v2.png).

The user requested visible points on the actual screen and identified the primary stat as score after N rounds. Two clarifications resolved the meaning: **whole tournament**, then **N rounds across all games**. The implementation now leads with six avatars, raw cumulative scores and a global round cursor. The original normalized/weighted measures remain expandable. Score units, self-play counting and the fixed-schedule mix limitation are explicit in [score presentation](../score-presentation.md).

## Context retention

The user required the entire project context to remain in the repository. [CONTEXT.md](../CONTEXT.md) indexes the authoritative documents, decisions, history, source, evidence, limitations and next work. [AGENTS.md](../../AGENTS.md) makes updates mandatory for future contributors. Current rendered evidence is tracked in [current](current/); source art, prompts and model definitions also live in the repository. Local scratch logs and machine-specific tool integration are not the sole record of any project decision.

## From lab to living world — 23 November 2026

The user said the lab was not exactly what they wanted and chose evolution over generations plus a visual simulation with fewer caveats. Offered two shapes with ASCII previews, they chose a **living grid** over a **population river**, and chose to **replace** the lab rather than keep both. They then asked for work to be as creative and innovative as possible.

The grid keeps the Hands-on Lab materials (green paper, peach actions, fonts, avatar atlas) and adds: creature cells (rounded with eyes for nice strategies, sharp squares for Always Defect), brightness by score, conversion flashes, paintable storm weather, rewind with a faded erased future, an inspector with a duel strip, a palette that doubles as the leaderboard, and four story scenarios. The lab's screens are kept as [lab scores](history/lab-scores-desktop.png), [lab phone](history/lab-scores-phone.png), [lab encounter](history/lab-encounter-desktop.png) and its [review](history/lab-review.md). Current evidence: [current](current/).

First feedback on the grid: the user could not find a way to stop it (Pause was below the fold in a single column), and found the random-mix Storm front too confusing. Pause/Step/Restart moved into a sticky bar above the world; Storm front became identical stripes on both halves with a dashed storm border and a key.

## Still unresolved

The grid needs the user's reaction, especially to the creative additions, plus beginner and real-device testing. No independent review, formal accessibility certification or real-life model validation has established its usability. Public website hosting and branding remain separate decisions.
