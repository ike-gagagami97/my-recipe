---
name: recipe-feature
description: Implement My Recipe list/detail/create/edit flows with App Router and Supabase. Use when adding or changing recipe CRUD UI or data access.
---

# Recipe feature

## Before starting

1. Read the feature doc under `docs/product/features/` (§1–6 required; Gherkin in §5, acceptance in §6). If missing, stop and ask for stage ② docs.
2. Confirm scope in [`docs/product/vision.md`](../../../docs/product/vision.md)
3. If tables are missing, invoke [`supabase-migration`](../supabase-migration/SKILL.md) first
4. Reuse `src/lib/supabase/{client,server}.ts` — do not add new client factories

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
- [ ] Draft PR opened; do not merge to production
- [ ] `docs/product/vision.md` status updated if MVP progress changed

## Do not

- Put the service-role key in client or public server paths
- Build auth-scoped multi-user models before P2
- Mix unrelated refactors into the same change
