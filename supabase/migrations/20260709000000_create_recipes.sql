-- Recipes table for the My Recipe app.
create table if not exists public.recipes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  created_at timestamptz not null default now()
);

-- Enable Row Level Security. This starter app allows public read/insert so the
-- UI works without auth; tighten these policies once auth is added.
alter table public.recipes enable row level security;

create policy "Public recipes are viewable by everyone"
  on public.recipes for select
  using (true);

create policy "Anyone can insert a recipe"
  on public.recipes for insert
  with check (true);

-- Table-level privileges for the API roles (RLS still applies on top of these).
grant usage on schema public to anon, authenticated;
grant select, insert on public.recipes to anon, authenticated;
