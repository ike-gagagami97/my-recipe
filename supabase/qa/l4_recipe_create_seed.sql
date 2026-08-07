-- L4（人間 Preview 受け入れ）用の補助データ — レシピ追加 / issue #6
--
-- 追加そのもののデータはフォーム操作で作る。この seed は主に
-- 「他ユーザーのレシピが自分の一覧に出ない」確認用の他ユーザー行を用意する。
--
-- 使い方
--   1. `CHANGE_ME@example.com` を Preview でログインする自分（ユーザーA）のメールに書き換える
--   2. `OTHER_USER@example.com` を別の確認済みユーザー（ユーザーB）のメールに書き換える
--   3. Supabase Studio の SQL Editor に全文を貼って実行する
--   4. 確認が終わったら supabase/qa/l4_recipe_create_cleanup.sql を実行して片付ける
--
-- 注意
--   - 手動実行専用。`supabase db reset` では流れない
--   - 本番データベースには投入しない
--   - タイトルは `【L4-Create-` で始まるので後片付けはタイトルで一括削除できる

insert into public.recipes
  (id, user_id, title, cooking_time_minutes, ingredients, steps, notes, created_at, updated_at)
select v.id, u.id, v.title, v.cooking_time_minutes, v.ingredients, v.steps, v.notes, v.ts, v.ts
from auth.users u
cross join (values
  (
    'c0000000-0000-4000-8000-000000000001'::uuid,
    '【L4-Create-Other】他ユーザーの隠しレシピ',
    20,
    $$隠し材料$$,
    $$隠し手順$$,
    $$ユーザーB所有。ユーザーAの一覧には出ないこと$$,
    now() - interval '1 day'
  )
) as v(id, title, cooking_time_minutes, ingredients, steps, notes, ts)
where u.email = 'OTHER_USER@example.com'
on conflict (id) do nothing;

-- 確認: 他ユーザー行が1件あること（メールを書き換えていないと 0 件）
select r.id, r.title, u.email as owner_email
from public.recipes r
join auth.users u on u.id = r.user_id
where r.title like '【L4-Create-%';
