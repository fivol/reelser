#!/usr/bin/env node
// Marks the zones the app covers (guides/frame.md) on 1080×1920 stills, so a check is
// not by eye: the point of attention must stay out of the red.
// Usage: node scripts/zones.mjs <still.png>… → writes <still>-zones.png next to each.
import {spawnSync} from 'node:child_process';
import {ffCommand} from '../bot/media.mjs';

const red = 'color=red@0.35:t=fill';
const boxes = [
  `drawbox=x=0:y=0:w=1080:h=250:${red}`, // status bar, «Reels» header
  `drawbox=x=0:y=1440:w=1080:h=480:${red}`, // username, caption, audio strip
  `drawbox=x=850:y=900:w=230:h=540:${red}`, // like / comment / share rail
  `drawbox=x=0:y=250:w=60:h=1190:${red}`, // side margins
  `drawbox=x=1020:y=250:w=60:h=650:${red}`,
  'drawbox=x=0:y=240:w=1080:h=1440:color=yellow@0.8:t=3', // profile grid crop
].join(',');

const files = process.argv.slice(2);
if (!files.length) {
  console.error('Usage: node scripts/zones.mjs <still.png>…');
  process.exit(1);
}
let failed = 0;
for (const file of files) {
  const out = file.replace(/(\.\w+)?$/, '-zones.png');
  const [cmd, args] = ffCommand('ffmpeg', ['-y', '-loglevel', 'error', '-i', file, '-vf', `scale=1080:1920,${boxes}`, out]);
  const r = spawnSync(cmd, args, {stdio: 'inherit', windowsHide: true});
  if (r.status) failed++;
  else console.log(out);
}
process.exit(failed ? 1 : 0);
