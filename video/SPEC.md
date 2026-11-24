# SPEC: "One bad apple"

GOAL:    The viewer wants to open the board and rig the game themselves.
OUTPUT:  HyperFrames, 1920 x 1080, 30 fps.
TIME:    38.9 s x 30 = 1167 frames (game 0-35.4 s, end card 35.4-38.9 s). Music to be fitted (target ~120 BPM = 15 frames a beat, a bar = 60 frames); cuts follow the camera, not the drums.

LOOK:    The product's own Tabletop world, nothing added.
         Ground: lid cobalt #2340c4, flat, no texture, no grain, no vignette. Cards: paper #f5f7ff, board field #e6e9f8,
         solid offset shadow 0 16px 0 #142a8f (no blur). Ink #10173a on paper, #f5f7ff on cobalt.
         Accent yellow #ffd23a only where the product uses it: the primary button, the score-track knob, badges, and the end-card URL button.
         Display: Lilita One 400, titles 84 px (banners) and 112 px uppercase with a 0 8px 0 #142a8f drop (main title, end card), tracking +1%.
         Body: Rethink Sans 700/800, 30-34 px for anything meant to be read; UI labels follow the app at 1.25x world scale.
         Title banners are the product's own banner: ink #10173a plate, radius 22 px, 28 px 36 px padding, light text.
OBJECTS: The board: 48 x 48 tokens (circles; Always Defect a rounded square), two ink eyes when a cell is 14 px or larger on screen,
         brightness = how well it is doing (alpha 0.3 + 0.7 x score/3). Drawn from the real engine (assets/game-data.js).
         The seven pieces: the app's SVG paths (src/Pieces.tsx), ink outline. The score track: stacked shares in piece colours,
         yellow knob with ink ring, moment pins and pill list with the app's exact wording. The tray, tools, designer and setup cards:
         rebuilt from src/App.tsx with real labels. The cursor: an ink arrow with a 3 px white edge, 64 px tall (6% of frame height).
MOTION:  Camera: one continuous take; moves 0.6-2.0 s on cubic in-out, zoom interpolated in log space; it arrives where the cursor
         needs to be, then holds while the UI acts. Enter: titles stamp in (scale 1.18 -> 1, back.out(2.2), 6 frames, opacity in 3 frames);
         banners exit by dropping 40 px and fading in 9 frames. Pieces drop with back.out(1.8) over 12 frames; staggers 4 frames.
         Conversions pop to 1.4x and settle over 21 frames (the app's 0.7 s glow). Pills and pins pop 0.6 -> 1 over 8 frames.
SHOTS:   (frames; one hero move each; what is read; sound; hand-off)
  1    0-75   Close on the board's centre, ~17 cells across, cooperators blinking. A red spike drops into the centre cell and lands at f24. | clack | the spike becomes the board's square token.
  2   75-240  Turns 0->14 play (2.5 turns/s); camera pulls back to the whole board on the right. Read: "One defector. Everyone else trusts." (f100-168), "Every turn, they copy the best." (f175-235) | conversion pops | the board keeps shrinking into the app.
  3  240-315  Pull back until the whole app sits on the right of the lid; the title stamps in on the left: WHO INHERITS THE WORLD? (3 lines). Turns 14->18. | whoosh on the pull-back | the camera dives at the Tit for Tat corner.
  4  315-540  Push to the top-left Tit for Tat team (turns 18->24): "Then Tit for Tat fights back." (f330-400). Then down to the score track at 1.6x (turns 24->40): pins and pills arrive when the app would announce them: Always Defect takes the lead (13), peaks at 78% (shown at 21), Tit for Tat takes the lead (26), Always Defect dies out (35). | pop per pill | the camera lifts to the whole board and tray.
  5  537-780  "Then you rig the game." (low banner, f537-600). Cursor clicks Pause (f588, turn holds at 44), clicks Storm (f609), drags a storm across the top right (f621-642); clicks Your piece (f663), the designer opens; push to the tray; clicks First move: C (f699) and the camera holds 1.7 s on "It plays exactly like Tit for Tat."; pulls back and places five of your pieces (f770-788). | click, clacks | the camera drops to the setup cards.
  6  780-990  Cursor clicks Kaleidoscope (f813); the camera swoops in until the board fills 87% of the frame height with its legend in view (f846); the 96 x 96 one-shot game blooms from one defector at temptation 1.85 (turns 0->44 by f990). | riser peaking on the arrival | the pattern keeps growing.
  7  984-1062 Over the still-growing pattern: "No winner is scripted." on a cobalt plate, 120 px; the words leave at f1046 and the plate grows to fill the frame. | whoosh | the full-frame plate is the end card's lid.
  8 1062-1167 End card (the app's opening lid): the six pieces drop onto the shelf (stagger 3 frames), the title wipes in left to right, the yellow button suvodeep12.github.io/game-theory lands at f1101 and holds 66 frames. | clacks, pop | end.
BANNED:  the default list in spec.md (dark void, glow, gradients, glass, cream-serif-mono, three cards, docked logo, fade-and-slide-up everywhere,
         text moving while read, corner labels); any UI the app does not have; invented numbers (every number comes from game-data.js);
         emoji; tilting the product in 3D; a small app window floating in empty space; a title overlapping the product (fixed at 9.6 s in review).
QA:      f0 board close-up, not black or empty; f24 spike landed on the centre; f200 defectors spread and title 2 readable;
         f300 whole app on the right, title on the left; f470 four moments in the pill list, pins on the track; f630 storm painted;
         f720 designer open with the Tit for Tat sentence; f930 kaleidoscope fills the frame height, symmetric; f1020 claim readable;
         f1160 end card complete: title, shelf, URL button.
