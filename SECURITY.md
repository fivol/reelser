# What this bot does on your computer

Written for the owner and for the agent that installs the bot: everything the code does, so it can be checked rather than trusted. The bot is ~2,600 lines of plain JavaScript in `bot/` and `scripts/`, with no npm dependencies; read them before installing.

## Who controls it

- **The owner, and the guests the owner invites.** The installer gives the user a link `t.me/<bot>?start=<code>` with a code it made up and stored in `.env`; opening it claims the bot. Without a code, the first person to press Start is only a request until the user confirms «this is me» on the computer the bot runs on (`bot/claim.mjs`). The owner can share projects (`/projects` → «👥 Share»): a one-time invite link, valid for 7 days, makes whoever opens it a guest with that project. Someone who opens the bot without an invite (its link was passed on) reaches no agent: the owner gets one question with that person's Telegram name, «give access» (a new project or one of theirs) or «say no»; a yes makes them a guest the same way, a no is final (an invite still works). A guest's messages go to their own copy of the bot (`bot/guests.mjs`, state in `data/guests/<id>/`), which sees only the guest's projects and runs at most the daily number of tasks the owner set (30 by default); the owner's tasks go first, and `/people` closes a guest's access at once. Anyone the owner said no to, or whose access was closed, gets one line and never reaches the agent. Private chats only: added to a group, the bot leaves. Who has access is in `data/access.json`, written only by the bot (`bot/access.mjs`).
- **The agent acts only on the owner's (or a guest's) behalf.** A turn of the agent starts only from: an owner's or guest's message or button tap, the daily batch of ideas at the time the owner set (`ideasAt`, can be turned off), or an update the owner approved. Nothing else, no remote commands.
- **No remote control by the author.** The repo cannot push code to your machine: the bot only *checks* for a new version and installs it after the owner taps «⬆️ Update» (`bot/update.mjs`). Checks can be turned off (`updateChecks: false`).
- **Stop at any time.** «⏹ Stop» or `/stop` kills the agent with every process it started, including background renders.

## Network

The bot itself talks to:

| Where | Why | Code |
|---|---|---|
| `api.telegram.org` | receive the owner's messages, send replies and files | `bot/telegram.mjs`, `bot/profile.mjs` |
| this repo on GitHub | every 6 hours: is there a new version (`git fetch`, or `api.github.com` when installed from an archive); the new version's code (`git pull` or `codeload.github.com`) only after the owner taps «Update» | `bot/update.mjs` |

Tools it starts may download what they need:

| Tool | Downloads | When |
|---|---|---|
| `npm ci --ignore-scripts` | Remotion and React from the npm registry, exact versions from `template/package-lock.json`, no package install scripts run | setup; an approved update that changes `template/package*.json` |
| Remotion | headless Chromium; Google Fonts while rendering | setup; renders |
| GitHub releases of `astral-sh/uv` | the `uv` binary, into `data/tools/` | the first voice message, if `uv` is missing |
| `uvx whisper-ctranslate2` | the speech-to-text package (PyPI) and model (Hugging Face) | the first voice message |

The agent (Claude Code or Codex) talks to its own provider and, while making a reel, may open web pages and download music the owner's request needs — the same as when you use it yourself.

**No telemetry, no analytics, no other endpoints.** Check: `grep -rn "http" bot scripts`.

## Processes

| Program | Why | Code |
|---|---|---|
| the agent CLI (`claude -p` / `codex exec`) | one turn per owner message, prompt on stdin | `bot/agents.mjs` |
| `git` (only in a git clone) / `tar` | update check and approved updates | `bot/update.mjs` |
| `npm ci --ignore-scripts` | template dependencies after an approved update | `bot/update.mjs` |
| `tar`, `uvx` | unpack `uv` (first use), local speech-to-text | `bot/stt.mjs` |
| `ffmpeg` / `ffprobe` | fit files into Telegram's limits, loudness | `bot/media.mjs`, `scripts/loudnorm.mjs` |
| `ps` / `taskkill` | find and stop the agent's processes on «Stop» | `bot/agents.mjs` |
| `caffeinate -s` (macOS) / `SetThreadExecutionState` via PowerShell (Windows) / `systemd-inhibit` (Linux) | while the agent works on a task: blocks idle sleep, so the task does not freeze; between tasks, only if the owner turned on «stay awake on the charger»: keeps the computer awake while plugged in. No system setting is changed; the request ends with the task or the bot | `bot/awake.mjs` |
| `node` | the bot, its supervisor, renders | `bot/run.mjs`, `scripts/render.mjs` |

## Files

- Read outside the folder: with Codex, its own session files in `~/.codex/sessions` — only the plan-limit numbers of the bot's session, for `/usage` and limit warnings.

- Written by the bot: `data/` (state, logs, who has access and each guest's own bot state in `data/guests/`, files the owner sent, menus, render jobs, backups of bot files you edited before an update replaced them), `projects/` (per project: brief, ideas, playbook, reels, files the owner sent), `template/node_modules`; on an approved update, the bot's own files in this folder.
- Caches of the tools it starts (uv's package cache, the Whisper model, npm, Remotion's Chromium) go to the usual per-user cache folders.
- Outside the folder, once at setup: one autostart entry — `~/Library/LaunchAgents/com.reels-bot.plist` (macOS), `~/.config/systemd/user/reels-bot.service` (Linux) or `reels-bot.vbs` in the Startup folder (Windows).
- Secrets: the bot token and `OWNER_CODE` live only in `.env` (gitignored, never printed, never sent anywhere but Telegram).

## What the agent may do

The agent runs headless, so it cannot show permission prompts: it starts with them turned off (`--dangerously-skip-permissions` / `--dangerously-bypass-approvals-and-sandbox`). Its limits are the rules in [REELS.md](REELS.md), which it follows as instructions:

- work inside the bot's folder; read other folders only when the owner named them or approved access with a button (remembered per project in `projects/<slug>/settings.json`, `allowedPaths`);
- never publish, post or email anything; never edit the owner's product code;
- with Claude Code, use the owner's global plugins and MCP connections only if the owner said yes at setup (`agentGlobalSettings`).

For a guest the agent works under stricter rules, [GUEST.md](GUEST.md): only the guest's project folder and the bot's own code, never `.env`, `data/`, other projects, the home folder or the machine's settings; no owner's plugins or MCP servers (`agentGlobalSettings` does not apply). What the bot enforces itself, not through the agent: a guest's bot cannot open, switch to or archive a project that is not theirs, cannot see the owner's chat or session, and cannot change the machine-wide settings or update the bot; with Claude Code, the agent's own file tools (Read, Write, Edit) are denied `.env`, `data/`, other projects and private home folders (`~/.ssh`, `~/Library`, `~/Downloads`…) by permission rules that hold even with permissions skipped.

This is a rule set, not an operating-system sandbox: the agent has the permissions of your user account, as it does in your terminal, and shell commands a guest's agent runs are bound by GUEST.md only. Share with people you trust with your computer. Claude Code's own sandbox was tried for guests and does not fit yet: Remotion's Chromium cannot render inside it on macOS. For hard isolation, run the bot under a separate OS user or in a container.

## Removing it

Ask the agent that installed it — it follows [MANAGE.md](MANAGE.md). By hand: delete the autostart entry, then the folder; send `/revoke` (or `/deletebot`) to @BotFather.
