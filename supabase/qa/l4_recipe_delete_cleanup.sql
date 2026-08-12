-- L4 後片付け — レシピ削除 / issue #26
-- supabase/qa/l4_recipe_delete_seed.sql で投入した行だけを削除する。

delete from public.recipes
where title like '【L4-Delete%';
