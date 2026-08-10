---
name: recipe-feature
description: Implement My Recipe list/detail/create/edit flows with App Router and Supabase. Use when adding or changing recipe CRUD UI or data access.
---

# Recipe feature

## Before starting

1. **Read the linked GitHub Issue first** — confirm all requirements before touching the feature doc.
2. Read the feature doc under `docs/product/features/` (§1–6 required; Gherkin in §5, acceptance in §6).
   - If missing or not yet approved by the human, stop. Do not start implementation.
   - Drafting or editing it? Run the `feature-doc-reviewer` subagent before asking for approval.
   - Feature doc changes must be committed and pushed before asking for human approval (humans cannot review uncommitted files).
   - Approval is always the human's responsibility — never self-approve.
3. Confirm scope in [`docs/product/vision.md`](../../../docs/product/vision.md)
4. If tables are missing, invoke [`supabase-migration`](../supabase-migration/SKILL.md) first
5. Reuse `src/lib/supabase/{client,server}.ts` — do not add new client factories

## Implementation

- List/detail: prefer Server Components + server Supabase client
- Create/update/delete: prefer Server Actions (Route Handlers only if needed)
- Keep `"use client"` minimal (forms/interactivity)
- Types follow DB columns; do not invent wide placeholder models
- Primary CTAs（追加・保存）= filled button look; Cancel = bordered secondary button — not underlined text links（see `app-router-ui` rule）

## Placement

| Kind | Path |
| --- | --- |
| Pages | `src/app/...` |
| Shared UI | `src/components/` (create when first needed) |
| Data helpers | `src/lib/` (logic beyond client creation) |

## L4 test data

L4 is a human running the acceptance criteria on Preview, so hand them data instead of asking them to invent it. Put a manual-run seed and a matching cleanup script in `supabase/qa/` (not `supabase/seed.sql`, which `db reset` executes), and link both from the feature doc §6 確認メモ.

- Resolve `user_id` with `from auth.users u ... where u.email = '...'` so the only thing to edit is the address, and a typo inserts nothing instead of writing to the wrong account
- Give every row a title prefix so cleanup is one `delete ... where title like '...%'`
- Cover the awkward cases, not just the happy path: all-empty record, null numeric, very long title and lines, blank lines and stray spaces, `<b>`-style strings, a last-year timestamp, boundary values for every filter, and one row owned by another user for RLS
- Run it against the local stack and look at the screens before handing it over

### Hosted DB before L4（繰り返し: #25）

Vercel Preview **does not** apply `supabase/migrations/` to the hosted Supabase project. Local `db reset` is not enough for L4.

If the PR adds/changes RLS policies or grants (UPDATE / DELETE / new table, etc.):

1. Put the exact SQL (or migration path) in feature doc §6 確認メモ **and** the PR Deploy notes
2. Tell the human to apply it on the hosted DB (Studio SQL Editor or `supabase db push`) **before** L4 save/delete flows
3. Symptom if skipped: screen loads (SELECT works) but write fails with 0 rows / misleading “not found”

When a write Server Action gets `data: null` with `error: null` after UPDATE/DELETE, distinguish “row missing” from “row readable but write blocked (policy/grant)” — do not always say 見つかりません.

## Done when

- [ ] Feature doc acceptance criteria are met (or gaps reported)
- [ ] Out-of-scope items in the feature doc / vision were not implemented
- [ ] Missing Supabase config is handled (guard or clear error)
- [ ] `npm run lint` passes (broader test levels: see `docs/development/test-level-policy.md`)
- [ ] `npm run test:unit` passes (if `src/lib/recipes.ts` was changed)
- [ ] `npm run test:e2e` passes for existing specs (auth / recipe-list / recipe-detail)
- [ ] If new screens were added: new E2E spec added in `tests/e2e/` covering §5 Gherkin
- [ ] UI changes also pass [`verify-frontend-change`](../verify-frontend-change/SKILL.md)
- [ ] L2 / L3 handed to the `acceptance-verifier` subagent (do not self-certify §5 / §6)
- [ ] If migration or RLS is included: `code-reviewer` **and** `db-security-auditor` subagents have been run and findings addressed
- [ ] Draft PR opened; do not merge to production
- [ ] `docs/product/vision.md` status updated if MVP progress changed
- [ ] After L4 OK or human merge: run workflow **⑤** without waiting to be asked — recurring risks go into skill / rule / workflow (feature doc appendix alone is not enough)

## Do not

- Put the service-role key in client or public server paths
- Build auth-scoped multi-user models before P2
- Mix unrelated refactors into the same change
- Skip ⑤ because the human did not explicitly request a retrospective
