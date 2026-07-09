---
name: supabase-migration
description: Add or change Supabase tables, RLS, grants, and seeds via supabase/migrations. Use for any schema or policy change.
---

# Supabase migration

Source of truth: `supabase/migrations/`.

## Before starting

1. Read data-access rules in [`docs/architecture/overview.md`](../../../docs/architecture/overview.md)
2. Read existing migrations; avoid duplicates and silent breaking changes
3. Local verify needs Docker + `supabase start` (`AGENTS.md`)

## Create a migration

```text
supabase/migrations/YYYYMMDDHHMMSS_description.sql
```

Required for each new table:

1. `create table ...`
2. `alter table ... enable row level security`
3. RLS policies for intended roles/actions
4. **`grant` for `anon` / `authenticated`** (without grants, REST returns `permission denied`)

Example (open read/write for early MVP — revisit before production):

```sql
create table public.recipes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null default '',
  created_at timestamptz not null default now()
);

alter table public.recipes enable row level security;

create policy "recipes_select_anon"
  on public.recipes for select
  to anon, authenticated
  using (true);

create policy "recipes_insert_anon"
  on public.recipes for insert
  to anon, authenticated
  with check (true);

grant select, insert on table public.recipes to anon, authenticated;
```

## Apply and verify

```bash
sg docker -c "supabase db reset"   # Cloud VM may need docker group
```

- `db reset` reapplies all migrations from scratch
- Hosted projects: use `supabase db push` (or team equivalent)

## Done when

- [ ] RLS enabled
- [ ] Both policies and grants present
- [ ] Breaking changes documented in ADR or PR
- [ ] App queries/types updated in the same PR (or follow-up Issue linked)

## Do not

- Treat dashboard-only edits as source of truth
- Ship RLS without grants
- Use the service role on normal app paths
