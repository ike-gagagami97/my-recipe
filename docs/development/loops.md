# Agent loops (Cursor)

Loop ideas adapted from [Getting started with loops](https://claude.com/ja/blog/getting-started-with-loops), applied to **Cursor** agents (IDE and Cloud).

A loop is: gather context → act → verify → repeat until a **stop condition**. Prefer the simplest loop that fits the task.

## Loop types (mapped to Cursor)

| Type | Trigger | Stop when | In Cursor |
| --- | --- | --- | --- |
| Turn-based | Your prompt | Agent believes the task is done (or needs you) | Normal Agent / Cloud Agent chat |
| Goal-based | Prompt with explicit done criteria | Criteria met or max attempts | Put acceptance criteria in the prompt; require `verify-*` skills |
| Time / recurring | Schedule or repeated check | You cancel, or queue empty | Cursor Cloud Automations / scheduled agents when available; otherwise manual re-runs |
| Proactive | Event (CI fail, new issue) | Each item triaged/fixed | Automations + clear goals + verification skills |

Claude Code `/goal`, `/loop`, `/schedule` are product-specific. In Cursor, encode the same intent with **acceptance criteria in the prompt**, **skills for verification**, and **Cloud Automations** when you want recurrence.

## Improve turn-based loops with verification skills

Do not accept "I edited the file" as done. Encode human checks in skills so the agent can self-verify.

This repo's baseline:

- UI work → `.cursor/skills/verify-frontend-change/SKILL.md`
- Schema work → checklist inside `supabase-migration`
- Optional second opinion → `.cursor/agents/code-reviewer.md`

Quantitative checks beat vague ones (`npm run lint` exit 0, console errors = 0, Lighthouse ≥ N, tests green).

## Writing goal-based prompts

Include:

1. Goal (user-visible outcome)
2. Done criteria (measurable)
3. Stop / attempt cap ("stop after 3 tries and report blockers")
4. Which skill/agent to use

Example:

```text
Goal: homepage loads with no console errors and npm run lint passes.
Use skill verify-frontend-change. Stop after 3 fix attempts and summarize remaining issues.
```

## Quality system around the loop

- Keep the codebase consistent so agents copy good patterns
- Keep docs reachable (`docs/`, short `AGENTS.md`)
- When a failure mode repeats, encode it in a **skill**, **path-scoped rule**, or **hook** — not only fix the one bug
- Use a separate review pass (`code-reviewer` agent or human PR review) so the implementer is not the only judge

## Token / cost hygiene

- Small tasks: one turn-based agent, no subagent fan-out
- Procedures in skills (load on demand), not always-on rules
- Deterministic scripts/CI for fixed steps (cheaper than re-reasoning)
- Don't schedule recurring agents more often than the signal changes
