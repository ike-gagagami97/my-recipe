---
name: recipe-feature
description: Implement My Recipe list/detail/create/edit flows with App Router and Supabase. Use when adding or changing recipe CRUD UI or data access.
---

# Recipe feature

## Before starting

1. **Read the linked GitHub Issue first** — confirm all requirements before touching the feature doc.
2. Read the feature doc under `docs/product/features/` (§1–6 required; Gherkin in §5, acceptance in §6).
   - If missing or not yet approved by the human, stop. Do not start implementation.
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

## Placement

| Kind | Path |
| --- | --- |
| Pages | `src/app/...` |
| Shared UI | `src/components/` (create when first needed) |
| Data helpers | `src/lib/` (logic beyond client creation) |

## Done when

- [ ] Feature doc acceptance criteria are met (or gaps reported)
- [ ] Out-of-scope items in the feature doc / vision were not implemented
- [ ] Missing Supabase config is handled (guard or clear error)
- [ ] `npm run lint` passes (broader test levels: see `docs/development/test-level-policy.md`)
- [ ] UI changes also pass [`verify-frontend-change`](../verify-frontend-change/SKILL.md)
- [ ] If migration or RLS is included: `code-reviewer` subagent has been run and findings addressed
- [ ] Draft PR opened; do not merge to production
- [ ] `docs/product/vision.md` status updated if MVP progress changed

## Do not

- Put the service-role key in client or public server paths
- Build auth-scoped multi-user models before P2
- Mix unrelated refactors into the same change
