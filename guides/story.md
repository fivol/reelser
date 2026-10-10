# Story and pace

Defaults for the shape of any reel. `<project>/PLAYBOOK.md` and the owner's words win.

## Shape

```
frame 0     COVER     its own picture (frame.md)
0–2 s       HOOK      the claim or the situation, moving from frame 1 (hooks.md)
2–7 s       STAKE     why this matters to the viewer, one beat
7 s – end   BODY      one idea per beat; the frame changes every beat
last 2–3 s  PAYOFF    deliver what the hook promised, then one ask
```

- **One idea per reel.** Two ideas are two reels: say so and pitch the second one.
- **Length:** 15–25 s for product and motion reels, about 14 s for a concept loop; talking reels as long as the point needs, no padding. Under 7 s only inflates loops.
- **The shortest setup that sets up the turn.** Cut every line of a chat, every step and every side detail the payoff does not need.
- **Change the frame every beat** (cut, push-in, new element). A static shot over ~4 s is where people leave.
- **Cuts land on bar starts** of the track (`scripts/beats.mjs`).
- **Measured pace:** calm, never rushed, no dead air. A new interface needs time to be read: one action at a time, about 2 s per step.
- **The end** delivers the hook's promise, then one ask: by default «Подпишись» to this profile. No links to leave for, no second ask. Echoing a word or image from the hook makes the replay land.

## Showing a product

- Show what it really does today, on its real screens, as they look now (current app and OS versions: check fresh references). Never fake a feature.
- Phones look like phones: a realistic device frame, messages arriving as they really do (notification, real chat UI).
- Push in on the part of the screen that matters instead of showing the whole phone; highlight it plainly (dim the rest, a label next to it).
- A person's actions are visible: a finger tap, a search typed letter by letter.
- Show the whole collection before narrowing it; show a feature as a run of two or three steps, not one.
- A teaser (link preview, notification) never gives away the payoff, and what it lists matches the real screen later, in the same order.
- Everyday, emotional situations beat neutral examples («подарок на ДР» over «рецепт»). Demo content is about life, not «Note 1».

## Look and motion

- Every reel gets its own look from its subject; never reuse an earlier reel's.
- Clean and modern beats costume themes (no velvet curtains, ticket stubs).
- Slow eased push-ins and pans; no pulsing on beats, no shake, no moving decoration behind the subject.

## Music

- Picked for the reel's mood; playful and upbeat by default, never plaintive. Every reel gets its own track; offer a few and say which one you take by default.
- Loudness about −15 LUFS, peak below −1 dBFS, no clipping. If `scripts/loudnorm.mjs` leaves peaks above that (trap, dense mixes), add `alimiter=limit=0.85:level=0` and re-measure.
