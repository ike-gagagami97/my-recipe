# Cursor subagents

Subagents for **Cursor**. One markdown file per agent: YAML frontmatter (`name`, `description`, optional `model` / `readonly` / `is_background`) + the system prompt as the body.

Each runs in its **own context window** with no access to the parent conversation, so the caller must pass what the agent needs (doc path, base URL, credentials). In return, the parent's context stays clean.

| Agent | Use when | Stage |
| --- | --- | --- |
| [`feature-doc-reviewer`](./feature-doc-reviewer.md) | A feature doc is drafted or edited, before implementation starts | ② |
| [`code-reviewer`](./code-reviewer.md) | A diff needs a second pass (static review) | ④ |
| [`db-security-auditor`](./db-security-auditor.md) | Migrations, policies, grants, or auth-scoped queries changed | ④ |
| [`acceptance-verifier`](./acceptance-verifier.md) | Before opening or updating a PR for a behavior or UI change (L2 / L3) | ④-3 |

Stages refer to [`docs/development/workflow.md`](../../docs/development/workflow.md).

## Why these four

Each one is a **judge**, kept separate from the implementer, and each reads or produces enough noise (whole docs trees, SQL dumps, browser transcripts) that isolating it is worth the extra call.

Invoke explicitly with `/<name>` when you know which pass you need; the `description` field is what lets the main agent pick one on its own.

## Read-only

`readonly: true` is enforced by the runtime, not by prose — prefer it over asking an agent nicely.

`acceptance-verifier` is deliberately **not** read-only: it starts the dev server and inserts QA rows. Its prompt forbids editing application code instead.

## When not to add an agent

- Needs the current conversation's history → keep it in the main agent (subagents start clean)
- A procedure the implementer should follow themselves → [`../skills/`](../skills/)
- A constraint that applies to certain paths → [`../rules/`](../rules/) with `globs`
- Must happen every time, reliably → a hook or CI, not a prompt

Four focused agents beat a dozen vague ones. See [`docs/development/steering.md`](../../docs/development/steering.md).
