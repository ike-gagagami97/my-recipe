# 0002. Cursor-native agent steering layout

- Status: accepted
- Date: 2026-07-09

## Context

We want AI-assisted development with clear skills, rules, and verification loops. Claude Code blog posts describe a useful model (CLAUDE.md / skills / rules / subagents / hooks / loops), but this team develops in **Cursor**.

## Decision

- Use **Cursor paths**: `AGENTS.md`, `.cursor/skills/`, `.cursor/rules/`, `.cursor/agents/`, optional `.cursor/hooks.json`
- Keep `CLAUDE.md` as a thin pointer to `AGENTS.md` only
- Do not use `.claude/` or a top-level `agent-skills/` as the primary layout
- Borrow loop/steering *ideas* from Claude articles; document Cursor mappings in `docs/development/steering.md` and `loops.md`

## Consequences

- Cursor IDE and Cloud Agents load project skills/rules from `.cursor/`
- Contributors reading Claude blogs must translate paths via `steering.md`
- Hooks can be added later when we need deterministic enforcement beyond prompted rules
