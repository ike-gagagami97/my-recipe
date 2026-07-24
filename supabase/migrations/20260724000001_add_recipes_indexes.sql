-- pg_trgm: enables GIN index for ILIKE '%keyword%' partial match
create extension if not exists pg_trgm;

-- title partial match search (ilike '%...%')
create index recipes_title_trgm_idx
  on public.recipes using gin (title gin_trgm_ops);

-- sort/filter by updated_at per user (covers the default sort path)
create index recipes_user_updated_idx
  on public.recipes (user_id, updated_at desc);

-- filter/sort by cooking_time_minutes
create index recipes_cooking_time_idx
  on public.recipes (cooking_time_minutes);
