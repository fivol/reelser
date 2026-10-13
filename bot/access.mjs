// Sharing: who besides the owner may use the bot, and with which projects.
// The owner makes a one-time invite link per project; whoever opens it becomes a guest
// with that project. Someone who just opens the bot without one asks the owner, once,
// and the owner's yes makes them a guest the same way. A guest sees only their projects (shared with them or created by
// them); the owner sees everything. Kept in the owner's data/access.json, which only
// the bot writes: never the agent, never a guest's process except through these calls.
import {randomBytes} from 'node:crypto';
import {readFileSync, renameSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {GUEST, SHARED} from './config.mjs';

const FILE = join(SHARED, 'access.json');
const INVITE_DAYS = 7;
export const DEFAULT_TURNS = 30;

/**
 * {invites: {code: {slug, created, expires}}, guests: {id: {name, username, chatId, projects, own, turnsPerDay, revoked, added}},
 * requests: {id: {name, username, chatId, at, denied?}}}
 */
export function loadAccess() {
  try {
    const a = JSON.parse(readFileSync(FILE, 'utf8'));
    return {invites: a.invites ?? {}, guests: a.guests ?? {}, requests: a.requests ?? {}};
  } catch {
    return {invites: {}, guests: {}, requests: {}};
  }
}

function save(a) {
  writeFileSync(`${FILE}.tmp`, JSON.stringify(a, null, 2));
  renameSync(`${FILE}.tmp`, FILE);
}

const edit = (fn) => {
  const a = loadAccess();
  const out = fn(a);
  save(a);
  return out;
};

/** The guest record, or null; revoked guests count as none. */
export function guest(id) {
  const g = loadAccess().guests[String(id)];
  return g && !g.revoked ? g : null;
}

export const activeGuests = () => Object.entries(loadAccess().guests).filter(([, g]) => !g.revoked).map(([id, g]) => ({id, ...g}));

/** True if this process may see the project: always for the owner, a guest only theirs. */
export const canSee = (slug) => !GUEST || Boolean(guest(GUEST)?.projects.includes(slug));

/** Names of the guests who have this project. */
export const guestsOf = (slug) => activeGuests().filter((g) => g.projects.includes(slug)).map((g) => g.name);

/**
 * True if a project nobody worked in may be removed by this process when left: the
 * owner's own (no guest has it), or one the guest created themselves.
 */
export const removable = (slug) => (GUEST ? Boolean(guest(GUEST)?.own?.includes(slug)) : !guestsOf(slug).length);

/** Gives guest `id` the project; `own` marks one the guest created. */
export function grant(id, slug, {own = false} = {}) {
  edit((a) => {
    const g = a.guests[String(id)];
    if (!g) return;
    if (!g.projects.includes(slug)) g.projects.push(slug);
    if (own && !g.own.includes(slug)) g.own.push(slug);
  });
}

/** Takes the project away from guest `id`. */
export function ungrant(id, slug) {
  edit((a) => {
    const g = a.guests[String(id)];
    if (g) g.projects = g.projects.filter((s) => s !== slug);
  });
}

/** A one-time invite code for the project, valid for a week. */
export function createInvite(slug) {
  const code = randomBytes(9).toString('base64url');
  edit((a) => {
    const now = Date.now();
    for (const [c, i] of Object.entries(a.invites)) if (i.expires < now) delete a.invites[c];
    a.invites[code] = {slug, created: now, expires: now + INVITE_DAYS * 86_400_000};
  });
  return code;
}

// The person becomes a guest (again, if they were revoked) with the project.
function addGuest(a, {id, chatId, name, username}, slug) {
  const key = String(id);
  const old = a.guests[key];
  const isNew = !old || old.revoked;
  delete a.requests[key];
  a.guests[key] = {
    name, username, chatId,
    projects: [...new Set([...(old && !old.revoked ? old.projects : []), slug])],
    own: old && !old.revoked ? old.own : [],
    turnsPerDay: old?.turnsPerDay ?? DEFAULT_TURNS,
    revoked: false,
    added: old?.added ?? Date.now(),
  };
  return {slug, isNew};
}

/** Uses up an invite. Returns {slug, isNew} or null for an unknown or expired code. */
export function redeemInvite(code, who) {
  return edit((a) => {
    const inv = a.invites[code];
    delete a.invites[code];
    if (!inv || inv.expires < Date.now()) return null;
    return addGuest(a, who, inv.slug);
  });
}

/**
 * Someone without an invite opened the bot. Returns 'new' (the owner should be asked),
 * 'pending' (already asked) or 'closed' (the owner said no, or closed their access).
 */
export function requestAccess({id, chatId, name, username}) {
  return edit((a) => {
    const key = String(id);
    if (a.guests[key]?.revoked) return 'closed';
    const r = a.requests[key];
    if (r) return r.denied ? 'closed' : 'pending';
    a.requests[key] = {name, username, chatId, at: Date.now()};
    return 'new';
  });
}

/** The owner's answer to a request: a project for a yes (as an invite would), null for a no. */
export function answerRequest(id, slug) {
  return edit((a) => {
    const r = a.requests[String(id)];
    if (!r || r.denied) return null;
    if (!slug) {
      r.denied = true;
      return null;
    }
    return {...addGuest(a, {id, ...r}, slug), who: r};
  });
}

/** An open request from this person, or null. */
export const request = (id) => {
  const r = loadAccess().requests[String(id)];
  return r && !r.denied ? r : null;
};

/** Closes guest `id`'s access; their projects stay with the owner. */
export function revoke(id) {
  edit((a) => {
    if (a.guests[String(id)]) a.guests[String(id)].revoked = true;
  });
}

const LIMITS = [10, 30, 100];

/** Moves guest `id` to the next daily turn limit (10 → 30 → 100 → 10). */
export function cycleLimit(id) {
  return edit((a) => {
    const g = a.guests[String(id)];
    if (!g) return null;
    g.turnsPerDay = LIMITS[(LIMITS.indexOf(g.turnsPerDay) + 1) % LIMITS.length];
    return g.turnsPerDay;
  });
}
