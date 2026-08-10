-- L4 レシピ編集テストデータの後片付け / issue #25
-- Studio SQL Editor で実行する。本番には使わない。

delete from public.recipes
where title like '【L4-Edit%';

select count(*) as remaining_l4_edit_rows
from public.recipes
where title like '【L4-Edit%';
