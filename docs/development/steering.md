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
| `run-tests` | Running or writing unit (Vitest) / E2E (Playwright) tests |

## Path-scoped rules in this repo

| Rule | Globs | What it enforces |
| --- | --- | --- |
| `app-router-ui.mdc` | `src/app/**`, `*.tsx` | Server Components, Supabase client usage, UI conventions |
| `supabase-migrations.mdc` | `supabase/migrations/**` | Append-only, RLS + grant checklist |
| `testing.mdc` | `*.test.ts`, `tests/e2e/**`, config files | Unit vs E2E separation, storageState constraints, key gotchas |

## Agents in this repo

Index: [`.cursor/agents/README.md`](../../.cursor/agents/README.md)

| Agent | When | Stage |
| --- | --- | --- |
| `feature-doc-reviewer` | Feature doc drafted/edited, before implementation | ② |
| `code-reviewer` | Second-pass review of a diff without editing | ④ |
| `db-security-auditor` | Migrations, policies, grants, auth-scoped queries changed | ④ |
| `acceptance-verifier` | §5 Gherkin / §6 in a browser (L2 local, L3 Preview) | ④-3 |

Each is a **judge separated from the implementer**, and each one reads or emits enough noise (docs trees, SQL dumps, browser transcripts) that a separate context window pays for itself.

Prefer a **skill** when the implementer should follow the procedure themselves, or when the task needs the current conversation's history — subagents start with a clean context and cannot see it.

## Compatibility note

Claude blog posts mention `.claude/skills`, `CLAUDE.md`, etc. This repository standardizes on **Cursor** (`.cursor/…`, `AGENTS.md`). Do not reintroduce `.claude/` as the primary layout.
