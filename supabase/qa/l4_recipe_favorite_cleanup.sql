-- L4 後片付け — レシピお気に入り / issue #37
-- supabase/qa/l4_recipe_favorite_seed.sql で投入した行だけを削除する。

delete from public.recipes
where title like '【L4-Fav%';
