# Project instructions

1. Ask, don't assume. If intent, architecture, or requirements are unclear, ask before writing. When running unattended, take the most reasonable interpretation and record the assumption.
2. Use the simplest complete solution appropriate to the problem. Do not add flexibility that is not needed.
3. Do not touch unrelated code. Surface unrelated defects separately.
4. Flag uncertainty. Use a small, local, low-risk experiment when that can resolve it; distinguish evidence from assumptions.
5. Suggest better approaches when useful, including improvements with lasting value.

## Repository context is mandatory

The user requires the entire project context to remain in this repository. Never make chat history, agent memory, ignored working files, or a local tool panel the only record of a material decision.

- Start with [docs/CONTEXT.md](docs/CONTEXT.md), then read its linked requirements, rules, current design, and validation records as needed.
- Record new user requirements, definitions, approved choices, rejected directions and why, assumptions, work in progress, known limitations, verification evidence, and next steps in the appropriate tracked document.
- Update the context index and affected authoritative documents in the same change as an implementation. Mark proposals and unverified claims explicitly. Retain historical context while clearly identifying what supersedes it.
- Keep meaningful design assets, current screenshots, reproduction steps, and verification summaries tracked. Local caches are not durable evidence.
- Before handoff, make the context sufficient for another contributor to continue without this conversation. Run `npm run check:context` to check Markdown local file targets, then review context completeness manually. Do not claim a commit, push, test, deployment, or user approval without evidence.
- Keep credentials, temporary files, dependencies, build output, and machine-specific tool configuration out of the public repository. Preserve their relevant decisions and verification results as redacted, portable documentation.

## Product and model integrity

Use the exact definitions in [simulation rules](docs/simulation-rules.md) and [score presentation](docs/score-presentation.md). Preserve seeded rules version 1 unless a result-affecting simulation change is explicitly approved and versioned. Do not silently replace the model to make a UI story work.

## Design

Hallmark and Impeccable were explicitly requested together. Preserve the incumbent visual system in [DESIGN.md](DESIGN.md), while addressing the user's reported comprehension problems. Avatars must be distinct. Nice means never defects first in error-free play; it does not mean forgiving or guaranteed to win.

Keep Impeccable's design hooks installed and enabled. During UI work, verify integration and repair missing integration with supported Impeccable commands. Ask the user to review pending hook trust in Codex. Disable hooks only at the user's explicit request.

## Verification and publication

Run `npm test` and `npm run build` for simulation or interface changes. Verify the actual browser path for meaningful UI changes, with desktop and phone evidence. State physical-device and comprehension limits honestly. Use Conventional Commit messages. The user authorized the public repository at `https://github.com/suvodeep12/game-theory`; the user chose GitHub Pages for public hosting, so every push to `main` deploys to https://suvodeep12.github.io/game-theory/.
