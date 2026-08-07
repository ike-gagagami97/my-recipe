-- L4 テストデータの後片付け — レシピ追加 / issue #6
--
-- seed で投入した行と、L4 中にフォームで作ったタイトル接頭辞付きの行を削除する。
-- 手で作った通常レシピは消えない（接頭辞が違うため）。

delete from public.recipes
where title like '【L4-Create-%'
   or title like '[L4-Create]%';

select count(*) as remaining
from public.recipes
where title like '【L4-Create-%'
   or title like '[L4-Create]%';
