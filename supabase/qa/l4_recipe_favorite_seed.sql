-- L4（人間 Preview 受け入れ）用の補助データ — レシピお気に入り / issue #37
--
-- 使い方
--   1. `CHANGE_ME@example.com` を Preview でログインする自分のメール（ユーザーA）に書き換える
--      RLS 確認用に `OTHER_USER@example.com` も別の確認済みユーザー（ユーザーB）に書き換える
--   2. ホスト DB に migration `20261005000000_add_recipes_is_favorite.sql` を適用済みであること
--   3. Supabase Studio の SQL Editor に全文を貼って実行する
--   4. 確認が終わったら supabase/qa/l4_recipe_favorite_cleanup.sql を実行して片付ける
--
-- 注意
--   - 手動実行専用。`supabase db reset` では流れない
--   - 本番データベースには投入しない
--   - タイトルは `【L4-Fav` で始まるので後片付けはタイトルで一括削除できる

insert into public.recipes
  (id, user_id, title, cooking_time_minutes, ingredients, steps, notes, is_favorite, created_at, updated_at)
select v.id, u.id, v.title, v.cooking_time_minutes, v.ingredients, v.steps, v.notes, v.is_favorite, v.ts, v.ts
from auth.users u
cross join (values
  (
    'f0000000-0000-4000-8000-000000000001'::uuid,
    '【L4-Fav-01】お気に入り・定番カレー',
    30,
    $$カレールー$$,
    $$煮込む$$,
    $$詳細トグル確認用$$,
    true,
    now() - interval '2 days'
  ),
  (
    'f0000000-0000-4000-8000-000000000002'::uuid,
    '【L4-Fav-02】非お気に入り・サラダ',
    5,
    $$レタス$$,
    $$切る$$,
    $$一覧トグルで ON にする確認用$$,
    false,
    now() - interval '1 day'
  ),
  (
    'f0000000-0000-4000-8000-000000000003'::uuid,
    '【L4-Fav-03】お気に入り・検索用みそ汁',
    9,
    $$味噌$$,
    $$溶く$$,
    $$お気に入りのみ + キーワード AND 確認用$$,
    true,
    now() - interval '3 hours'
  ),
  (
    'f0000000-0000-4000-8000-000000000004'::uuid,
    '【L4-Fav-04】お気に入り・短いパスタ',
    15,
    $$麺$$,
    $$茹でる$$,
    $$所要時間 AND 確認用$$,
    true,
    now() - interval '4 hours'
  )
) as v(id, title, cooking_time_minutes, ingredients, steps, notes, is_favorite, ts)
where u.email = 'CHANGE_ME@example.com'
on conflict (id) do nothing;

-- ページネーション確認用: お気に入りをさらに 10 件（合計お気に入り 13 件相当）
insert into public.recipes
  (id, user_id, title, cooking_time_minutes, ingredients, steps, notes, is_favorite, created_at, updated_at)
select
  ('f0000000-0000-4000-8000-0000000000' || lpad(n::text, 2, '0'))::uuid,
  u.id,
  '【L4-Fav-P' || lpad(n::text, 2, '0') || '】ページ用お気に入り',
  20,
  $$材料$$,
  $$手順$$,
  $$ページネーション確認$$,
  true,
  now() - (n || ' hours')::interval,
  now() - (n || ' hours')::interval
from auth.users u
cross join generate_series(10, 19) as n
where u.email = 'CHANGE_ME@example.com'
on conflict (id) do nothing;

-- 他ユーザー行（ユーザーAが開いても見つからないこと）
insert into public.recipes
  (id, user_id, title, cooking_time_minutes, ingredients, steps, notes, is_favorite, created_at, updated_at)
select v.id, u.id, v.title, v.cooking_time_minutes, v.ingredients, v.steps, v.notes, v.is_favorite, v.ts, v.ts
from auth.users u
cross join (values
  (
    'f0000000-0000-4000-8000-000000000099'::uuid,
    '【L4-Fav-Other】他ユーザーの隠しレシピ',
    15,
    $$隠し材料$$,
    $$隠し手順$$,
    $$ユーザーB所有$$,
    true,
    now() - interval '5 days'
  )
) as v(id, title, cooking_time_minutes, ingredients, steps, notes, is_favorite, ts)
where u.email = 'OTHER_USER@example.com'
on conflict (id) do nothing;
