---
name: Game Theory
description: An approachable browser lab for inspecting cooperation and conflict
colors:
  paper: "#0b5735"
  paper-2: "#1d6a46"
  paper-3: "#08452b"
  ink: "#f7f8ed"
  muted: "#d2e4d6"
  rule: "#51866a"
  accent: "#ffba83"
  accent-2: "#f4a96b"
  accent-ink: "#493321"
  focus: "#f4dd85"
  card: "#f7f8ed"
  card-ink: "#173d2b"
  card-muted: "#4c6757"
  card-rule: "#c8d5c8"
  card-well: "#e8eee3"
typography:
  display:
    fontFamily: 'Gabarito, ui-sans-serif, system-ui, sans-serif'
    fontSize: "38px"
    fontWeight: 800
    lineHeight: 1.12
    letterSpacing: "-0.025em"
  headline:
    fontFamily: 'Gabarito, ui-sans-serif, system-ui, sans-serif'
    fontSize: "24px"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  title:
    fontFamily: 'Gabarito, ui-sans-serif, system-ui, sans-serif'
    fontSize: "20px"
    fontWeight: 800
    lineHeight: 1.3
    letterSpacing: "-0.025em"
  body:
    fontFamily: 'Manrope, ui-sans-serif, system-ui, sans-serif'
    fontSize: "1rem"
    fontWeight: 500
    lineHeight: 1.55
  label:
    fontFamily: 'Manrope, ui-sans-serif, system-ui, sans-serif'
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1.55
rounded:
  card: "16px"
  control: "9px"
  pill: "999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-ink}"
    rounded: "{rounded.control}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "{colors.accent-2}"
  button-secondary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "8px 16px"
  button-text:
    textColor: "{colors.ink}"
    rounded: "0px"
    padding: "8px 0px"
  input:
    backgroundColor: "{colors.paper-3}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "8px 12px"
  stage:
    backgroundColor: "{colors.card}"
    textColor: "{colors.card-ink}"
    rounded: "{rounded.card}"
    padding: "24px"
---

# Design System: Game Theory

## Overview

**Creative North Star: "Hands-on Lab"**

An approachable science exhibit expressed through ordinary browser controls and inspectable evidence. The approved Squeeze material uses a forest-green working field, a pale encounter stage, peach actions, and rounded heavy headings. Playfulness comes from the type and explicit action marks; explanations remain direct and conditional.

This is a scan of the implemented source, not a new direction. `PRODUCT.md` owns product truth; the Hands-on Lab surface contract owns its reading order. “Game Theory” remains a working label. Historical static alternatives do not define this system.

**Key Characteristics:**
- Chromatic working field and a pale, legible encounter stage.
- Heavy rounded headings paired with compact, readable explanations.
- Familiar controls and explicit, colour-independent C/D action marks.
- Measured results, their conditions, and their limitations remain inspectable.

## Colors

The palette combines a saturated forest ground with pale evidence surfaces and warm peach actions. Frontmatter values follow `src/tokens.css`; roles follow their actual use in `src/styles.css`.

The sidecar's eight-step tonal ramps are generated OKLCH panel previews, not additional shipped CSS tokens. Its component previews inherit the project's CSS custom properties; their snippets expand the actual component rules without a React dependency.

### Primary

- **Forest working field** (`paper`, `paper-2`, `paper-3`): page ground, secondary-button hover, selected topics, and recessed fields.
- **Peach action** (`accent`, `accent-2`, `accent-ink`): primary actions, selected segmented options, progress, and warning/error panels. Hover uses the second accent.

### Neutral

- **Pale encounter paper** (`card`, `ink`): the stage surface and text on the forest ground share the same primitive value, with distinct semantic roles.
- **Forest stage ink** (`card-ink`, `card-muted`): headings, C/D marks, labels, and explanations on pale surfaces.
- **Supporting text and rules** (`muted`, `rule`, `card-rule`, `card-well`): explanatory copy, dividers, and the filled D mark.
- **Yellow focus** (`focus`): keyboard focus on the forest ground. Pale stages locally replace this with forest stage ink.

**The Two Grounds Rule.** Use the ink pair belonging to the current ground; pale stages must not inherit the page's pale text.

## Typography

**Display Font:** Gabarito, with the sans-serif fallback stack in frontmatter.

**Body Font:** Manrope, with the sans-serif fallback stack in frontmatter.

Self-hosted TrueType files load Gabarito at weight 800 and Manrope at weights 500 and 700 with `font-display: swap`. Headings disable synthetic font styles. Rounded display lettering supplies warmth while the body stays precise enough for numerical evidence.

### Hierarchy

- **Display:** the frontmatter display role is the desktop question heading, constrained to 32ch; it reduces to 32px below 1100px and 30px below 720px.
- **Headline / Title:** section and subsection headings use the corresponding frontmatter roles.
- **Body:** explanatory text uses the body role, generally limited to 60ch by the application stylesheet.
- **Label:** tables, helper text, and most control labels use the label role; buttons and legends use weight 700. Main navigation is 15px on desktop and 14px on phones.
- **Finding:** measured result prose uses 20px at desktop and 18px below 720px, with the body line-height. Tables use tabular numerals.
- **Wordmark:** the working label uses Gabarito 800 at 27px with line-height 1.

**The Explicit Action Rule.** Pair C/D symbols with their written meanings and earned points; colour is not the sole carrier of the distinction.

## Layout

The application shell has a maximum width of 1312px and total horizontal inset of 128px. Below 1100px the inset becomes 64px; below 720px it becomes 32px. The active shell, rather than the unused generic container token, defines the page width.

Use the compact frontmatter spacing rhythm for controls, dividers, and evidence groups. The pale stage uses large spacing for padding on desktop and large vertical/medium horizontal padding on phones. Sections are separated with rules and large spacing rather than oversized empty bands.

Experiment setup uses three columns (1.25fr / 1fr / .7fr), changes to two below 1100px with the run controls spanning the row, and becomes one column below 720px. Introduction learning content uses two equal columns with extra-large spacing, then stacks on phones. Inspector controls and strategy descriptions also stack at the phone breakpoint. Navigation wraps; topic choices remain a locally scrollable strip.

Wide evidence stays a semantic table inside a focusable local scroller. The encounter trace has a minimum width of 780px on desktop and 760px on phones, with sticky strategy labels. Results and inspector row headings also remain pinned. Table captions are sticky at the scroller's left edge and wrap to the smaller of its inline size and 60ch. A sideways-scroll hint appears at widths below 1100px. Detailed tables cap vertical height at 440px. Do not compress numerical evidence into unreadable cells to fit a phone.

The base stylesheet also contains 60rem/40rem generic-container breakpoints. They do not replace the application's 1100px/720px shell and component behavior.

## Elevation & Depth

The active interface is flat: tonal contrast, thin dividers, and inset control strokes establish hierarchy. There are no applied raised-card shadows. The declared `--shadow-card` token is unused and is not a reusable elevation prescription. Sticky row headings preserve their matching ground during scrolling.

**The Flat Evidence Rule.** Use ground changes and rules to separate evidence; do not introduce raised-card stacks into this incumbent surface.

## Shapes

Pale stages use the card radius; buttons, inputs, selected options, and alert panels use the control radius. Topic selectors use the pill radius. C is a bordered circle (32px square, 2px stroke); D uses a gently squared silhouette (6px corners) and a pale filled well. These letters encode game actions rather than decorative iconography. Ordinary dividers and field strokes are 1px.

## Components

### Buttons

Peach primary actions use the frontmatter button primitive, weight 700, and a minimum height of 44px. Secondary buttons use the forest field and an inset rule stroke; on a pale learning stage they instead use pale paper and forest stage ink. Text actions are underlined and have no filled background. Hover changes the action tone; active enabled buttons move down 1px. Disabled buttons use opacity .55 and the unavailable cursor. Focus uses a 2px outline with 4px offset.

### Inputs / Fields

Native selects, number fields, and text inputs use the recessed forest background, a muted 1px border, control corners, and minimum height 44px. Radios and ranges retain native semantics and peach accent. Number fields are 90px wide. Segmented choices wrap; labels enclose real radios, expose a peach checked state, and receive a 3px visible outline when their radio is focused. Do not replace these with unlabelled visual toggles.

### Navigation / Topics

The compact masthead uses a bottom rule. Main navigation mixes text buttons and an anchor; its active view receives a peach inset underline. A labelled native select chooses one guided question. Phone navigation wraps below the working label; the question selector stays within the viewport.

### Encounter Stage / Tables

The pale stage is the signature evidence surface: rounded container, compact heading and caption, written C/D legend, synchronized rounds, sticky strategy names, and earned points beside every action. The experiment example is now behind “See how two strategies play”; the separately expandable result inspector identifies measured encounters. The introduction keeps its playable pale surface. Tables use captions, row/column headers, thin rules, and tabular numeric alignment.

### Progressive Detail / Runtime States

The experiment presents one explanation and primary run action. The latest user-confirmed primary readout is cumulative points after N rounds across all tournament games. Six distinct avatars remain paired with names, nice/nasty labels, raw points, and their own rounds played. Desktop uses two flat score columns; phone uses one column. A range and number input select N. Nice means never defects first in error-free play: five rounded identities and the angular Always Defect identity make that distinction visible. The transparent production atlas is `public/avatars/strategies-v2.png`; its source and prompts are tracked under `docs/design/avatars`. Avatar colour is not the sole source of identity or classification.

Native disclosures hold optional settings, predictions, rule examples, cooperation, weighted averages, variation, repetition values, encounter inspection, and model details. Completion focuses the score heading. The encounter adds explicit player-number labels and cumulative points at its selected round. Running work uses a labelled native progress element and polite status text. Stale settings, cancelled work, and failures use explicit copy; failure panels use peach rather than an unexplained red code. No partial tournament is presented as completed. The source supplies alert/status regions and labelled controls; this documents implementation mechanics, not a completed accessibility certification.

The interface uses a short background transition (120ms, the ease-out curve) for buttons. Reduced-motion CSS nearly eliminates transition and animation durations and restores automatic scrolling. A focus-revealed skip link reaches main content; chart evidence also has a table alternative.

## Do's and Don'ts

### Do:

- **Do** use the matching forest or pale-surface ink pair and visible keyboard focus.
- **Do** preserve explicit action meanings, labelled conditions, table captions, and local scroll affordances.
- **Do** keep findings qualified and distinguish the opening illustration from completed tournament evidence.
- **Do** reuse the self-hosted heading/body pairing and compact spacing rhythm.

### Don't:

- **Don't** encode cooperate/defect or runtime status through colour alone.
- **Don't** turn historical static alternatives or unused source tokens into new visual authority.
- **Don't** present the design scan as deployment, formal accessibility approval, physical-device validation, or beginner-comprehension evidence.

Source evidence: `src/tokens.css`, `src/base.css`, `src/styles.css`, `src/App.tsx`, `src/Avatar.tsx`, `src/scores.ts`, and `index.html`, refreshed on 1 November 2026. The user found both earlier experiment/result layouts confusing, then requested recognizable avatars, distinct nice/nasty families and cumulative tournament points at N. The introduction, simulation engine, fixed rules and seeded games remain unchanged; the primary score presentation changed explicitly. The production raster atlas and provenance are tracked. The prior finish verdict covers the earlier design; the current revision has local browser and visual verification and awaits user comprehension feedback. See `docs/CONTEXT.md` and `docs/validation.md` for scope. Formal accessibility, physical-device behavior and beginner tests remain unverified.
