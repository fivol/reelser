// Explains an agent failure to the owner in plain words. Known cases get advice;
// anything else is shown as is, with the exit code, so nothing is hidden.

const RU = {
  head: '⚠️ Агент не смог выполнить задачу.',
  spawn: (bin) => `Не нашёл программу агента (\`${bin}\`). Похоже, она не установлена или путь в настройках устарел — попроси своего агента заново пройти SETUP.md.`,
  login: 'Агент не залогинен или ключ недействителен. Открой его на компьютере и войди заново (`claude` → /login, или `codex login`).',
  limit: (when) => `Закончился лимит подписки агента${when ? ` (сброс: ${when})` : ''}. Нажми «🔁 Повторить», когда лимит обновится.`,
  billing: 'На балансе API-аккаунта агента закончились деньги. Пополни баланс и нажми «🔁 Повторить».',
  network: (who, tries) => `Связь компьютера с серверами ${who} рвётся${tries ? ` (я ${tries} раза пробовал продолжить сам — не вышло)` : ''}. Почти всегда дело в интернете или VPN:\n• VPN выключен — включи его;\n• VPN включён — смени сервер или включи режим «для всего компьютера» (TUN);\n• VPN не нужен — проверь интернет.\nПотом нажми «🔁 Повторить» — продолжу с того места.`,
  region: (who) => `Серверы ${who} отклонили запрос: из твоей страны они не работают. Похоже, VPN выключен или в нём выбрана неподходящая страна. Включи VPN (лучше в режиме «для всего компьютера», TUN) и нажми «🔁 Повторить».`,
  proxy: (addr) => `Бот ходит в интернет через VPN-программу на этом компьютере (${addr}), но она не отвечает — скорее всего, выключена. Запусти VPN и нажми «🔁 Повторить».`,
  overloaded: (who) => `Серверы ${who} сейчас перегружены — это на их стороне, у тебя всё в порядке. Обычно проходит за несколько минут: нажми «🔁 Повторить» чуть позже.`,
  version: 'Версия агента устарела для выбранной модели. Обнови его (`npm i -g @anthropic-ai/claude-code` или `npm i -g @openai/codex`) и нажми «🔁 Повторить».',
  context: 'Разговор с агентом стал слишком длинным. Начинаю новую сессию — нажми «🔁 Повторить».',
  turns: 'Агент упёрся в лимит шагов за один ход. Нажми «🔁 Повторить» — он продолжит с того места.',
  stalled: 'Агент завис: 15 минут без признаков жизни. Я его остановил. Нажми «🔁 Повторить» — он продолжит с того места.',
  overtime: 'Задача шла больше 2 часов, я её остановил. Нажми «🔁 Повторить», чтобы продолжить, или напиши, что упростить.',
  unknown: 'Неизвестная ошибка.',
  report: (url) => `Если повторяется — напиши в канал бота ${url}, в закрепе сказано как.`,
  details: 'Подробности',
  code: 'код',
  retry: '🔁 Повторить',
};
const EN = {
  head: '⚠️ The agent could not finish the task.',
  spawn: (bin) => `Could not find the agent program (\`${bin}\`). It is not installed or the configured path is stale — ask your agent to run SETUP.md again.`,
  login: 'The agent is not logged in or its key is invalid. Open it on the computer and log in again (`claude` → /login, or `codex login`).',
  limit: (when) => `The agent's plan limit is used up${when ? ` (resets: ${when})` : ''}. Tap «🔁 Retry» once it resets.`,
  billing: "The agent's API account is out of credit. Top it up and tap «🔁 Retry».",
  network: (who, tries) => `The connection between this computer and ${who}'s servers keeps dropping${tries ? ` (I tried to continue on my own ${tries} times, no luck)` : ''}. It is almost always the internet or a VPN:\n• VPN off — turn it on;\n• VPN on — switch its server or use the whole-computer mode (TUN);\n• no VPN needed — check the internet.\nThen tap «🔁 Retry» and I continue from there.`,
  region: (who) => `${who}'s servers refused the request: they do not serve your country. The VPN looks off or set to the wrong country. Turn it on (whole-computer mode, TUN, works best) and tap «🔁 Retry».`,
  proxy: (addr) => `The bot goes online through a VPN app on this computer (${addr}), but it does not answer — probably switched off. Start the VPN and tap «🔁 Retry».`,
  overloaded: (who) => `${who}'s servers are overloaded right now — that is on their side, nothing is wrong here. Usually gone in a few minutes: tap «🔁 Retry» a bit later.`,
  version: 'The agent is too old for the chosen model. Update it (`npm i -g @anthropic-ai/claude-code` or `npm i -g @openai/codex`) and tap «🔁 Retry».',
  context: 'The conversation with the agent got too long. Starting a new session — tap «🔁 Retry».',
  turns: 'The agent hit its step limit for one turn. Tap «🔁 Retry» and it continues from there.',
  stalled: 'The agent hung: no sign of life for 15 minutes, so I stopped it. Tap «🔁 Retry» and it continues from there.',
  overtime: 'The task ran for over 2 hours, so I stopped it. Tap «🔁 Retry» to continue, or tell me what to simplify.',
  unknown: 'Unknown error.',
  report: (url) => `If it keeps happening, write to the bot's channel ${url}; the pinned post says how.`,
  details: 'Details',
  code: 'code',
  retry: '🔁 Retry',
};

const RULES = [
  ['spawn', (r) => r.spawnError === 'ENOENT'],
  ['version', (r, t) => /requires a newer version|please upgrade|upgrade (codex|claude)|unsupported model/i.test(t)],
  ['billing', (r, t) => /credit balance|insufficient[_ ]quota|billing|payment required|402/i.test(t)],
  ['limit', (r, t) => /usage limit|limit reached|rate.?limit|hit your (usage )?limit|quota|429|too many requests/i.test(t)],
  // Anthropic answers 403 «Request not allowed» to countries it does not serve; OpenAI says so in words.
  ['region', (r, t) => /unsupported_country|unsupported country|request not allowed|not (available|supported) in your (country|region)|unsupported (country|region)/i.test(t)],
  ['login', (r, t) => /not logged in|please run \/login|log ?in again|invalid (api )?key|authentication|unauthori[sz]ed|\b401\b|\b403\b|oauth token/i.test(t)],
  ['context', (r, t) => /prompt is too long|context (length|window)|too many tokens|maximum context/i.test(t)],
  ['turns', (r, t) => /error_max_turns|max(imum)? turns/i.test(t)],
  // A local proxy (a VPN app in proxy mode) that is not running refuses the connection.
  ['proxy', (r, t) => /ECONNREFUSED[^\n]*(127\.0\.0\.1|localhost|::1)|proxy (error|connection|refused)|tunneling socket/i.test(t)],
  ['network', (r, t) => /ECONNRESET|ECONNREFUSED|ETIMEDOUT|ENOTFOUND|EAI_AGAIN|ENETUNREACH|EHOSTUNREACH|fetch failed|connection (dropped|error|reset|refused|closed)|stream (disconnected|error)|socket hang up|network|timed? ?out/i.test(t)],
  ['overloaded', (r, t) => /overloaded|\b5\d\d\b|internal server error|bad gateway|service unavailable/i.test(t)],
];

/** True when the session id is unknown to the agent (deleted or from another machine). */
export const lostSession = (res) => /no conversation found|session .*not found|thread .*not found|unknown (session|thread)/i.test(`${res.text}\n${res.stderr ?? ''}`);

/** Failures that pass on their own: the bot retries these before telling the owner. */
export const transient = (kind) => kind === 'network' || kind === 'overloaded';

/** Classifies a failed turn: 'network', 'region', 'login', … or 'unknown'. */
export function errorKind(res) {
  const raw = `${res.text ?? ''}\n${res.stderr ?? ''}`;
  return res.forcedKind ?? RULES.find(([, test]) => test(res, raw))?.[0] ?? 'unknown';
}

/** Who runs the agent's servers, for the owner-facing messages. */
export const vendor = (agent) => (agent === 'codex' ? 'OpenAI' : 'Claude');

/**
 * Returns {kind, text, retry}: the owner-facing explanation of a failed turn.
 * `tries`: how many times the bot already retried it on its own.
 */
export function explain(res, {lang, bin, agent, channel, tries = 0}) {
  const L = lang === 'en' ? EN : RU;
  const raw = `${res.text ?? ''}\n${res.stderr ?? ''}`.trim();
  const kind = errorKind(res);
  const who = vendor(agent);
  // Claude reports «…limit reached|<unix time>» or «resets 5pm»: show the reset time if present.
  const epoch = raw.match(/limit reached\|(\d{10})/)?.[1];
  const when = epoch ? new Date(Number(epoch) * 1000).toLocaleString(lang === 'en' ? 'en-GB' : 'ru-RU', {hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short'})
    : raw.match(/(?:resets?|try again) (?:at |in )?([^\n,;]{3,30}?)(?:\.|$)/im)?.[1];
  // Host and port only: a proxy URL may carry a password.
  const proxyEnv = process.env.HTTPS_PROXY || process.env.https_proxy || process.env.ALL_PROXY;
  const proxy = raw.match(/(?:127\.0\.0\.1|localhost):\d+/)?.[0] ?? (proxyEnv && URL.parse(proxyEnv)?.host) ?? 'proxy';
  const advice = (kind === 'spawn' ? L.spawn(bin) : kind === 'limit' ? L.limit(when) : kind === 'proxy' ? L.proxy(proxy)
    : kind === 'network' ? L.network(who, tries) : ['region', 'overloaded'].includes(kind) ? L[kind](who) : L[kind])
    // A failure without a known cause may be a bug in the bot: show where to report it.
    + (channel && ['unknown', 'stalled'].includes(kind) ? `\n${L.report(channel)}` : '');
  const detail = raw.split('\n').filter(Boolean).slice(-6).join('\n').slice(0, 700);
  const code = res.code ?? res.spawnError ?? '—';
  return {
    kind,
    text: `${L.head}\n${advice}\n\n${L.details} (${L.code} ${code}):\n\`\`\`\n${detail || '—'}\n\`\`\``,
    retry: L.retry,
  };
}
