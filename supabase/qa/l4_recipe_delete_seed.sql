-- L4（人間 Preview 受け入れ）用の補助データ — レシピ削除 / issue #26
--
-- 使い方
--   1. `CHANGE_ME@example.com` を Preview でログインする自分のメール（ユーザーA）に書き換える
--      RLS 確認用に `OTHER_USER@example.com` も別の確認済みユーザー（ユーザーB）に書き換える
--   2. Supabase Studio の SQL Editor に全文を貼って実行する
--   3. 確認が終わったら supabase/qa/l4_recipe_delete_cleanup.sql を実行して片付ける
--
-- 注意
--   - 手動実行専用。`supabase db reset` では流れない
--   - 本番データベースには投入しない
--   - タイトルは `【L4-Delete` で始まるので後片付けはタイトルで一括削除できる

insert into public.recipes
  (id, user_id, title, cooking_time_minutes, ingredients, steps, notes, created_at, updated_at)
select v.id, u.id, v.title, v.cooking_time_minutes, v.ingredients, v.steps, v.notes, v.ts, v.ts
from auth.users u
cross join (values
  -- 削除の happy path 用
  (
    'd0000000-0000-4000-8000-000000000001'::uuid,
    '【L4-Delete-01】削除対象・全部入り',
    30,
    $$じゃがいも 2個
玉ねぎ 1個$$,
    $$切る
煮る$$,
    $$削除前のメモ$$,
    now() - interval '2 days'
  ),
  -- キャンセル確認用（削除しない行）
  (
    'd0000000-0000-4000-8000-000000000002'::uuid,
    '【L4-Delete-02】キャンセル確認用',
    15,
    $$材料$$,
    $$手順$$,
    $$キャンセル後も残る$$,
    now() - interval '1 day'
  )
) as v(id, title, cooking_time_minutes, ingredients, steps, notes, ts)
where u.email = 'CHANGE_ME@example.com'
on conflict (id) do nothing;

-- 他ユーザー行（ユーザーAが開いても見つからないこと）
insert into public.recipes
  (id, user_id, title, cooking_time_minutes, ingredients, steps, notes, created_at, updated_at)
select v.id, u.id, v.title, v.cooking_time_minutes, v.ingredients, v.steps, v.notes, v.ts, v.ts
from auth.users u
cross join (values
  (
    'd0000000-0000-4000-8000-000000000099'::uuid,
    '【L4-Delete-Other】他ユーザーの隠しレシピ',
    15,
    $$隠し材料$$,
    $$隠し手順$$,
    $$ユーザーB所有。ユーザーAの詳細 URL では見つからないこと$$,
    now() - interval '5 days'
  )
) as v(id, title, cooking_time_minutes, ingredients, steps, notes, ts)
where u.email = 'OTHER_USER@example.com'
on conflict (id) do nothing;

select r.id, r.title, u.email as owner_email
from public.recipes r
join auth.users u on u.id = r.user_id
where r.title like '【L4-Delete%';
