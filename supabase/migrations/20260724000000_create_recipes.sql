-- recipes table
-- Each row belongs to one authenticated user.
-- RLS restricts all access to the owning user only.

create table public.recipes (
  id                   uuid        primary key default gen_random_uuid(),
  user_id              uuid        not null references auth.users(id) on delete cascade,
  title                text        not null,
  cooking_time_minutes integer     null,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- Auto-update updated_at on row changes
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger recipes_set_updated_at
  before update on public.recipes
  for each row execute function public.set_updated_at();

alter table public.recipes enable row level security;

create policy "recipes_select_own"
  on public.recipes for select
  to authenticated
  using (auth.uid() = user_id);

create policy "recipes_insert_own"
  on public.recipes for insert
  to authenticated
  with check (auth.uid() = user_id);

grant select, insert on table public.recipes to authenticated;
