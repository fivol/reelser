# Owner's footage and spoken scripts

For reels with the owner's own recordings: talking to camera, voice-over, filmed screens or life. `<project>/PLAYBOOK.md` and the owner's words win.

## Writing a script they will read

- Write it the way the owner talks (their earlier reels, messages and voice notes are the reference): short lines, plain spoken words, nothing they would have to rehearse.
- Time it before they shoot: about 150–170 words a minute; the hook line under 3 s, no line over ~4 s.
- Lines that only appear on screen are not spoken; mark which is which.
- Every iteration: send the full script with every agreed edit applied, never a partial patch.
- Ask them to record several takes per line, phone vertical, a lapel mic or quiet room, and a few seconds of silence first.

## Editing

- Pick the best take per line from a Whisper transcript.
- Trim every take to its speech by audio energy (Whisper word times drift by up to 0.7 s), about 0.1 s between lines: no dead air.
- Cut side details that only make it longer, even if they are in the owner's script; say what you cut.
- Word-by-word captions inside the safe zone (frame.md); music as a low bed under the voice.
- Full-screen inserts cut hard on the take boundary; a fade shows the previous take for a few frames and reads as a jerk.
- Logos and end cards get their own full-screen background, not on top of the footage.
- In the hook, the owner appears in one shot at most; the rest can be graphics.
- When the owner cannot describe the shot they want, send numbered 2 s candidates and let them pick.

## Footage as material

- Before a clip goes into Remotion, cut it to the part you use and conform it with ffmpeg (1080×1920, 30 fps, `-g 30` so seeking is cheap): Remotion decodes every frame it shows, and long or variable-frame-rate clips make renders slow.
- Look at a few frames of every clip before using it (`node scripts/ffmpeg.mjs -i <file> -vf fps=1 <dir>/f%02d.png`).
- Check reused footage for demo text or personal data before putting it in a new reel.
