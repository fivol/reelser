# Frame: safe zones, cover, on-screen text

Defaults for a 1080×1920 reel. `<project>/PLAYBOOK.md` and the owner's words win.

## Safe zones

The app draws over the edges of every reel, and the profile grid crops it.

```
y 0–250      top: status bar, «Reels» header, camera button
y 250–1440   safe: where the attention goes
y 1440–1920  bottom: username, caption, audio strip
x 850–1080   right: like / comment / share rail (from y ≈ 900 down)
grid crop    the profile grid shows the middle 3:4: y 240–1680
```

- The rule is about attention, not about every pixel. Whatever the viewer should look at right now stays inside x 60–850 (up to 1020 above y ≈ 900), y 250–1440: the caption or headline, the message that just arrived, the button being tapped, the part of a screen being shown, a speaking face.
- Everything else may run into the covered zones: backgrounds, pictures, parts of a phone or a screen, older messages, context around the action.
- A phone mockup puts the action near its edges (new chat bubbles and the input at the bottom, headers at the top). Move the phone or the camera so the active part sits mid-frame, even if the phone then runs off the top or bottom.
- Check every still with `node scripts/zones.mjs <still.png>…`: it writes `<still>-zones.png` with the covered zones in red and the grid crop in yellow. The point of attention in the red is a bug; anything else there is fine.

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
- Never put text on a face that is on screen and talking (or is what the viewer watches): captions and headlines go above or below it, or beside it. Check the face's box in the stills, per shot, since framing changes between takes.
