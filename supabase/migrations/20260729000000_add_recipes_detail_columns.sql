-- Detail fields shown on the recipe detail screen (issue #5).
-- ingredients / steps are newline separated: one ingredient or one step per line.
-- Existing rows keep NULL until the create/edit features land.
--
-- No new policy or grant is needed: RLS is row level and the table-level grants
-- from 20260724000000_create_recipes.sql already cover columns added later.

alter table public.recipes
  add column ingredients text null,
  add column steps       text null,
  add column notes       text null;
