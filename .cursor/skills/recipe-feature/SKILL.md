---
name: recipe-feature
description: Implement My Recipe list/detail/create/edit flows with App Router and Supabase. Use when adding or changing recipe CRUD UI or data access.
---

# Recipe feature

## Before starting

1. Confirm scope in [`docs/product/vision.md`](../../../docs/product/vision.md)
2. If tables are missing, invoke [`supabase-migration`](../supabase-migration/SKILL.md) first
3. Reuse `src/lib/supabase/{client,server}.ts` — do not add new client factories

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

- [ ] Out-of-scope vision items were not implemented
- [ ] Missing Supabase config is handled (guard or clear error)
- [ ] Operations work under intended RLS for `anon`
- [ ] `npm run lint` passes
- [ ] UI changes also pass [`verify-frontend-change`](../verify-frontend-change/SKILL.md)
- [ ] `docs/product/vision.md` status updated if MVP progress changed

## Do not

- Put the service-role key in client or public server paths
- Build auth-scoped multi-user models before P2
- Mix unrelated refactors into the same change
