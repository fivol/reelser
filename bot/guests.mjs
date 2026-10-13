// Guests' bots: each guest (bot/access.mjs) gets their own copy of bot/bot.mjs as a
// child process with its own data folder (data/guests/<id>/: state, agent session,
// queue, menus, logs). Only the owner's process polls Telegram; it hands every update
// from a guest to that guest's process. A child that exits is started again.
import {fork} from 'node:child_process';
import {existsSync, mkdirSync, openSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {DATA, ROOT} from './config.mjs';
import {activeGuests, guest} from './access.mjs';

const children = new Map(); // id → {child, ready, backlog, pause}
let closing = false;

export const guestDir = (id) => join(DATA, 'guests', String(id));

/** Writes a new guest's first state: they own their bot, with this project open. */
export function seedGuest(id, {chatId, name, slug}) {
  const dir = guestDir(id);
  mkdirSync(dir, {recursive: true});
  const file = join(dir, 'state.json');
  if (!existsSync(file)) writeFileSync(file, JSON.stringify({ownerId: Number(id), chatId, ownerName: name, project: slug, projectLog: [[0, slug]]}, null, 2));
}

function start(id) {
  const dir = guestDir(id);
  mkdirSync(dir, {recursive: true});
  const log = openSync(join(dir, 'bot.log'), 'a');
  const child = fork(join(ROOT, 'bot', 'bot.mjs'), [], {
    cwd: ROOT,
    stdio: ['ignore', log, log, 'ipc'],
    windowsHide: true,
    env: {...process.env, REELS_GUEST: String(id), REELS_DATA: dir, REELS_SHARED: DATA, REELS_BOT_SUPERVISED: '1'},
  });
  const prev = children.get(id);
  const entry = {child, ready: false, backlog: prev?.backlog ?? [], pause: prev?.pause ?? 2000, startedAt: Date.now()};
  children.set(id, entry);
  child.on('message', (m) => {
    if (!m?.ready) return;
    entry.ready = true;
    for (const u of entry.backlog.splice(0)) child.send(u);
  });
  child.on('exit', (code) => {
    if (children.get(id) !== entry) return;
    entry.ready = false;
    if (closing || !guest(id)) return children.delete(id);
    console.error(`guest ${id}: process exited (${code}), starting again`);
    // A run that lasted a minute resets the back-off.
    entry.pause = Date.now() - entry.startedAt > 60_000 ? 2000 : Math.min(entry.pause * 2, 60_000);
    setTimeout(() => children.get(id) === entry && start(id), entry.pause);
  });
}

/** Hands a Telegram update ({message} or {callback}) to the guest's process. */
export function forward(id, update) {
  id = String(id);
  if (!children.has(id)) start(id);
  const e = children.get(id);
  if (e.ready && e.child.connected) e.child.send(update);
  else e.backlog.push(update);
}

/** Starts every active guest's process: their scheduled ideas and unfinished tasks run on. */
export function startGuests() {
  for (const g of activeGuests()) if (!children.has(g.id) && existsSync(guestDir(g.id))) start(g.id);
}

/** Stops a guest's process with its agent (access revoked, or the owner's bot exits). */
export function stopGuest(id) {
  const e = children.get(String(id));
  children.delete(String(id));
  e?.child.kill('SIGTERM');
}

export function stopGuests() {
  closing = true;
  for (const id of [...children.keys()]) stopGuest(id);
}
