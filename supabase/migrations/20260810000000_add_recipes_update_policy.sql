-- Allow authenticated owners to update their own recipes (edit feature #25).
-- DELETE remains deferred to #26.

create policy "recipes_update_own"
  on public.recipes for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant update on table public.recipes to authenticated;
