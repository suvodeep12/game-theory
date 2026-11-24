# Review: "One bad apple" (38.9 s, 1920 x 1080, 30 fps)

## Creative calls
- Storyline A (picked by the user). Not built: B "Meet the cast" (a roll call of the pieces) and C "Kaleidoscope" (opens on the pattern, endless zoom). Both are in STORYLINES.md.
- Every board frame is the app's real engine: `tools/make-data.mts` replays the exact game a first-time visitor sees (seed 0, mutation 0.1%, the default designed piece) and a 96 x 96 Kaleidoscope at temptation 1.85. The four moments on the score track, their wording and the turns at which they appear are the app's own (Always Defect takes the lead at 13, peaks at 78% at 18 and shown at 21; Tit for Tat takes the lead at 26; Always Defect dies out at 35).
- The interface is rebuilt from the app's code (labels, colours, piece paths, the designer's sentences), at 1.25x the app's size so it reads on video. The storm and the five placed pieces are painted while the board is paused, as in the app; the film does not run the game on after painting.
- One continuous camera take over the app, then the end card rebuilt from the app's opening lid with its six pieces and a URL button.

## Measured
- `check`: 0 errors, 9 warnings (below). `snapshot --review` beat, seam and phone sheets looked at; frames around the reveal and the game-to-end-card seam looked at after fixes.
- Sound: effect peaks measured with `hyperframes audio` and placed one frame after their picture (clack 0.003 s, pop 0.10 s, whoosh 0.45 s, riser 1.98 s; the click file's usable click is at 1.85 s). Nobody has heard the mix.

## Fixed in review
- The "Your tray" and "Score track" headings inherited white text on white cards (invisible).
- The reveal title collided with the app at 9.6 s; the app now sits further right and the title stamps in after the camera settles (8.75 s).
- The designer's "It plays exactly like Tit for Tat" was on screen under a second; the camera now holds 1.7 s on it.
- An extra full-frame background covered frame 0; the claim plate now fills the frame before the cut; end-card pieces start above the frame.

## Warnings kept on purpose
- `line_unread` / `text_below_floor` on the app's own small labels (wordmark, speed, setup cards) while the camera passes: context, not lines to read.
- `line_unread` on the designer's first sentence: it is the "before" state that the click changes.
- `first_frame_empty` (heuristic): frame 0 is the board close-up drawn on the canvas, confirmed by snapshot.
- `timeline_track_too_dense` on the game scene: one continuous take is one scene by design.

## Open
- **Music:** "Ave Marimba" by Kevin MacLeod (CC BY 3.0), picked by the user from three Creative Commons candidates (HeyGen's catalog needs its CLI, which has no Windows build yet). It enters 6.955 s into the track so the Kaleidoscope arrival (28.2 s) lands on a beat and the full band arrives with the title's second line (8.9 s); 0.3 s fade-in, 1.6 s fade-out under the end card.
- **Credits:** see CREDITS.md (the music and the pop sound are CC BY): credit them wherever the video is published.
- **Weakest shot:** the storm (f621-642) is faint at full-app scale; with more time, push in to 1.5x while it is painted.
