-- Allow authenticated owners to delete their own recipes (delete feature #26).

create policy "recipes_delete_own"
  on public.recipes for delete
  to authenticated
  using (auth.uid() = user_id);

grant delete on table public.recipes to authenticated;
