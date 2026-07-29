-- L4 テストデータの後片付け — レシピ詳細 / issue #5
--
-- supabase/qa/l4_recipe_detail_seed.sql で投入した行だけを削除する。
-- タイトルが `【L4-` で始まる行が対象なので、手で作ったレシピは消えない。

delete from public.recipes
where title like '【L4-%';

-- 残っていないことの確認（0 件になれば OK）
select count(*) as remaining
from public.recipes
where title like '【L4-%';
