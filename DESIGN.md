---
name: Game Theory
description: A board game for six prisoner's dilemma strategies, told story first
colors:
  lid: "#2340c4"
  lid-deep: "#1c35a8"
  lid-raised: "#2a48d6"
  lid-on: "#3354e0"
  lid-shadow: "#142a8f"
  paper: "#f5f7ff"
  well: "#eef1ff"
  well-2: "#e6e8f2"
  field: "#e6e9f8"
  hover: "#dfe4fb"
  picked: "#fff6cf"
  ink: "#10173a"
  ink-2: "#4a5585"
  on-lid: "#f5f7ff"
  on-lid-2: "#dbe2ff"
  yellow: "#ffd23a"
  yellow-hover: "#ffdc5c"
  yellow-shadow: "#c99a00"
  strategy-cooperate: "#ffc23d"
  strategy-defect: "#e5383b"
  strategy-titfortat: "#17b0a3"
  strategy-grim: "#6f3fd0"
  strategy-generous: "#8ccf4d"
  strategy-wsls: "#ff85b8"
typography:
  display:
    fontFamily: "'Lilita One', 'Arial Rounded MT Bold', ui-rounded, system-ui, sans-serif"
    fontSize: "clamp(52px, 8.4vw, 120px)"
    fontWeight: 400
    lineHeight: 0.9
    letterSpacing: "0.01em"
  headline:
    fontFamily: "'Lilita One', 'Arial Rounded MT Bold', ui-rounded, system-ui, sans-serif"
    fontSize: "clamp(28px, 3.6vw, 42px)"
    fontWeight: 400
    lineHeight: 1.04
  title:
    fontFamily: "'Lilita One', 'Arial Rounded MT Bold', ui-rounded, system-ui, sans-serif"
    fontSize: "24px"
    fontWeight: 400
    lineHeight: 1.1
  body:
    fontFamily: "'Rethink Sans', system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "17px"
    fontWeight: 500
    lineHeight: 1.5
  label:
    fontFamily: "'Rethink Sans', system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "14px"
    fontWeight: 700
    lineHeight: 1.35
rounded:
  lid-frame: "30px"
  card: "24px"
  control: "16px"
  small: "12px"
  pill: "999px"
spacing:
  xs: "6px"
  sm: "10px"
  md: "14px"
  lg: "20px"
  xl: "28px"
---

# Design System: Tabletop

Chosen by the user on 24 November 2026 from three directions drawn on a Claude Design canvas (*Night Culture*, *Tabletop*, *Pictogram*), after asking for a from-scratch redesign with new creatures and a story-first opening. The canvas with every screen, state and phone layout: <https://claude.ai/artifact/JirY1sph2tn7JN3XnXB9g6> (private to the owner unless shared). Code: [styles.css](src/styles.css), [Pieces.tsx](src/Pieces.tsx), [Story.tsx](src/Story.tsx), [App.tsx](src/App.tsx).

## Overview

The page is a board game box. A cobalt lid carries the title and the six pieces on a shelf; the rules are a deck of five cards; the world is a white board with a tray of pieces beside it. Game-theory vocabulary stays plain: *turn* for a generation, *Reset* for restart, *setup cards* for scenarios, *score track* for the population timeline.

Two grounds, never mixed: **the lid** (cobalt, light text) and **paper** (cool white cards, ink text). Every card sits on the lid with a solid offset shadow in `lid-shadow`, like card stock on a table.

## Colors

- **Lid** `#2340c4`, darker `lid-deep` behind the rules deck, `lid-raised` / `lid-on` for setup cards and the mutation panel, `lid-shadow` for card shadows and the shelf.
- **Paper** `#f5f7ff` cards, `well` / `well-2` for rows and tiles inside them, `field` behind the board and score track, `picked` (pale yellow) for the selected tool or piece.
- **Ink** `#10173a` text on paper; `ink-2` for secondary text (6.7:1 on paper). On the lid: `on-lid`, `on-lid-2` (6.5:1).
- **Yellow** `#ffd23a` is the one action colour (primary buttons, knob, badges, focus ring on the lid) with a darker `yellow-shadow` underneath that compresses when pressed.
- **Strategy colours** are used only for pieces, board tokens and their share bars, never for text. They differ in lightness as well as hue, and shape carries identity too (below).

## Typography

Lilita One (display, headings, numbers that matter: shares, turn, scores, payoffs) over Rethink Sans (500 body, 600 notes, 700 labels, 800 primary buttons). Both are self-hosted from `@fontsource` packages, Latin subset only; licences in [public/fonts](public/fonts). The opening title is uppercase with a solid `lid-shadow` drop.

## The pieces

Six SVG game pieces in a 48 × 60 box ([Pieces.tsx](src/Pieces.tsx)), ink outline, two eyes, a mouth, and one tell for the rule:

| Piece | Tell |
| --- | --- |
| Always Cooperate | Plain pawn, open smile |
| Always Defect | The only angular piece: a spike with angry brows |
| Tit for Tat | Ears (it listens and answers) |
| Grim Trigger | Square head with a dark visor |
| Generous Tit for Tat | A yellow halo |
| Win-Stay, Lose-Shift | A spinner arrow (it switches) |

Nice means never defects first: the five nice pieces have round heads, Always Defect is the spike. On the board the same rule holds at token size: circles for the five, a rounded square for Always Defect. Brightness shows how well a piece is doing (dim = struggling).

## Layout

- **Opening**: full-height lid with a double inset frame, kicker line, title, lead, the shelf of six, two buttons (*Read the rules*, *Skip to the board*), and three plain facts.
- **Rules**: one card at a time (max 820 px) on a stack of two rotated cards; Back, five pips and Next below. Arrow keys flip cards.
- **Board**: transport row (Play/Pause, Next turn, Reset, Turn, Speed); board card; score track; side column with the piece card (when open), the tray with tools, setup cards and mutation. The board column is sized to the window height (`max(480px, 100vh − 270px)`) so the whole board fits on a laptop screen; below 900 px everything stacks.
- **Phone (≤ 640 px)**: transport buttons go icon-only, the tray becomes a row of six, and the piece card becomes a bottom sheet over a dimmed board.

## Components

- **Buttons**: yellow primary with a pressable shadow; translucent ghost on the lid; light (`well-2`) on dark banners. Minimum 44 px targets everywhere.
- **Tray piece / tool / setup card**: `aria-pressed` toggles; selected shows the `picked` fill with a yellow-and-ink ring; the leader gets a *Leading* badge (none on ties).
- **Piece card**: piece, name, plain rule, close; two stat tiles (score and weather, best nearby); a 12-round duel against the toughest neighbour where C is a light circle and D a dark square, slips get a dashed outline; then what it becomes next turn, tinted with that piece's colour.
- **Banners** on the board (top edge, ink): *one kind holds every square* (with *Paint some defectors* and *Try Storm front*), *the score track is full* at turn 1,000 (with Reset; Play and Next turn are disabled), and *Press Play when you're ready* before a first turn without autoplay.
- **Score track**: stacked shares over turns, a yellow knob at the current turn, the erased future drawn faded after you rewrite history. An invisible range input on top makes it keyboard-operable.

## Motion

Cards deal in (0.26 s). Changed cells flash a cobalt ring for 0.7 s. Storms show falling rain. With reduced motion: no autoplay, no deal or flash, and rain stays still.

## Do's and Don'ts

Do:
- Keep C/D distinct by letter, shape and lightness, never colour alone.
- Use the focus ring that matches the ground: yellow on the lid and on dark banners, cobalt on paper.
- Keep copy short and plain; numbers in Lilita One with tabular figures.

Don't:
- Don't call strategies good or bad; *nice* only ever means "never defects first".
- Don't put strategy colours behind text, or add a seventh accent colour.
- Don't script a winner or add claims the model doesn't support.
