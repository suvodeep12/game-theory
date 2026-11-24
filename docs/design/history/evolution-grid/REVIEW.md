# Current local review — evolution grid

23 November 2026. Local visual/interaction review by the implementing agent, not independent approval.

The [desktop capture](evolution-desktop.png) shows generation 0 of *One bad apple* at 1440 px (headless Edge does not advance the animation). The [phone capture](evolution-phone.jpg) shows the opening generations at 375 px with the transport bar wrapped to two rows above the world, the red wave starting around the defector, and the timeline beneath.

The incumbent visual system is kept: forest-green paper, peach primary actions, Gabarito/Manrope, the v2 avatar atlas. New elements: six strategy colours matched to the avatars (Always Cooperate lightened to apricot and Win-Stay, Lose-Shift shifted pink so they stay distinct as small cells), rounded cells with eyes for nice strategies and sharp squares for Always Defect, cell brightness by score, storm wash with falling streaks, and a share bar in each palette row.

Fixed after the user's feedback: Pause was out of sight below the world in narrow layouts ("there are no buttons to stop"), so a sticky transport bar now sits above the world; the random-mix Storm front was "too confusing", so it is now identical stripes on both halves with a dashed storm border and an explanatory key.

Found and fixed during this pass: missing avatar CSS after the stylesheet rewrite; Always Cooperate vs Win-Stay colour confusion; a "wide brush" icon that read as a selected radio; a 11 px label off the type ramp; a share bar implemented as a hard-stop gradient (flagged by Impeccable as a purple-gradient tell); the full-width grid trapping phone scrolling.

Not reviewed: real devices and touch, screen readers, beginner comprehension, the user's own aesthetic judgement.
