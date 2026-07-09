# Steering agents in Cursor

Ideas adapted from Claude Code steering guidance, mapped to **Cursor-native** paths.

## What goes where

| Kind of instruction | Cursor location | Loads when | Use for |
| --- | --- | --- | --- |
| Always-on project facts | `AGENTS.md` (+ short `.cursor/rules` with `alwaysApply: true`) | Every agent session | Commands, layout index, Cloud VM quirks, hard invariants |
| Path-scoped constraints | `.cursor/rules/*.mdc` with `globs` | Matching files in context | "Migrations are append-only", App Router conventions |
| Procedural workflows | `.cursor/skills/<name>/SKILL.md` | Skill invoked / matched to task | Deploy checklists, recipe feature steps, UI verify |
| Isolated side tasks | `.cursor/agents/<name>.md` | Subagent called | Code review, deep search — return a summary only |
| Deterministic automation | `.cursor/hooks.json` + scripts | Lifecycle events | Lint-on-edit, block dangerous commands (add when needed) |
| Long-form product/design | `docs/` | When agents/humans open them | Vision, architecture, ADRs — not every-session token cost |

## Decision tips

- **"Every time X, do Y" that must be reliable** → prefer a **hook** (or CI), not a paragraph in `AGENTS.md`. Models can miss prompted rules under pressure.
- **"Never do this" as a hard guardrail** → hook / permissions / CI, not only prose.
- **A multi-step procedure** → **skill**, not a long section in `AGENTS.md`.
- **Rule that only applies under some paths** → path-scoped `.mdc` with `globs`, not always-on.
- **Personal preferences** → user-level Cursor rules/skills, not the shared repo files.

## Keep `AGENTS.md` lean

Treat it as an index: commands, map of the repo, pointers into `docs/` and `.cursor/`. Aim to avoid dumping every checklist into it — that burns context on unrelated tasks.

## Skills in this repo

| Skill | When |
| --- | --- |
| `recipe-feature` | Recipe list/detail/create/edit |
| `supabase-migration` | SQL / RLS / grants |
| `ui-design` | Landing and visual design |
| `verify-frontend-change` | After any UI change — required before "done" |

## Agents in this repo

| Agent | When |
| --- | --- |
| `code-reviewer` | Second-pass review of a diff without editing |

## Compatibility note

Claude blog posts mention `.claude/skills`, `CLAUDE.md`, etc. This repository standardizes on **Cursor** (`.cursor/…`, `AGENTS.md`). Do not reintroduce `.claude/` as the primary layout.
