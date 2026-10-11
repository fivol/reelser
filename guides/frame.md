# Frame: safe zones, cover, on-screen text

Defaults for a 1080×1920 reel. `<project>/PLAYBOOK.md` and the owner's words win.

## Safe zones

The app draws over the edges of every reel, and the profile grid crops it.

```
y 0–250      top: status bar, «Reels» header, camera button        → no text
y 250–1440   safe for text and anything that must be read
y 1440–1920  bottom: username, caption, audio strip               → no text
x 850–1080   right: like / comment / share rail (from y ≈ 900 down) → no text
grid crop    the profile grid shows the middle 3:4: y 240–1680
```

- Text, buttons the viewer must notice and faces stay inside x 60–850 (up to 1020 above y ≈ 900), y 250–1440.
- That includes whatever is read inside a phone mockup, screen recording or app screenshot: chat bubbles, a tapped button, the list being shown. Only what is not read (backgrounds, decoration, the idle parts of a screen) may fill the whole frame.
- A phone mockup puts the action near its edges (chat bubbles and the input at the bottom, headers at the top). Move the phone or the camera so the active part sits mid-frame, even if the phone then runs off the top or bottom.
- Check every still with `node scripts/zones.mjs <still.png>…`: it writes `<still>-zones.png` with the covered zones in red and the grid crop in yellow. Anything to be read in the red is a bug.

## Cover

- The cover is **frame 0** of the reel, so the reel's own first frame and the uploaded cover are the same picture. Export the same image as `<slug>-vN-cover.png`.
- It is its own composition, designed to make someone in the grid or the feed tap: the strongest image of the reel plus the hook headline. It does not have to look like the opening scene.
- Hard cut from frame 0 to frame 1. The reel starts with action on frame 1; the cover never animates into the reel and is not shown off for seconds.
- The headline sits in the middle of the frame (about y 450–1350): big, readable at thumbnail size, in harmony with the picture. Never at the top or bottom: the grid crops them and the feed covers them.
- Clean composition: no UI clutter baked in, one focal point, high contrast.
- Cover-only extras (a badge, a static panel) live on frame 0 alone.

## On-screen text

- Six words or fewer per card; it is read at arm's length by someone not listening yet.
- The hook text is there on frame 1, not after a beat of silence.
- One headline per scene; on-screen text never repeats itself.
- Text sits next to what it explains. One point of attention at a time: never a caption at the top while the action happens at the bottom.
- Every line gets time to be read: roughly 0.3 s per word plus 0.5 s, never under 1 s.
- Talking reels: burn in word-by-word captions; most people watch muted first.
