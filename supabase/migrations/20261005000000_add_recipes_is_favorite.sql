-- Recipe favorites (#37): boolean flag on recipes.
-- Favorite-only updates must not bump updated_at (feature §8 Q4).

alter table public.recipes
  add column is_favorite boolean not null default false;

comment on column public.recipes.is_favorite is
  'Per-recipe favorite bookmark for the owning user. Default false.';

create or replace function public.set_recipes_updated_at()
returns trigger
language plpgsql
as $$
begin
  -- Skip updated_at bump when only is_favorite changed.
  if tg_op = 'UPDATE'
     and new.is_favorite is distinct from old.is_favorite
     and new.title is not distinct from old.title
     and new.cooking_time_minutes is not distinct from old.cooking_time_minutes
     and new.ingredients is not distinct from old.ingredients
     and new.steps is not distinct from old.steps
     and new.notes is not distinct from old.notes
     and new.user_id is not distinct from old.user_id
  then
    new.updated_at := old.updated_at;
  else
    new.updated_at := now();
  end if;
  return new;
end;
$$;
