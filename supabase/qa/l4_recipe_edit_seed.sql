-- L4（人間 Preview 受け入れ）用の補助データ — レシピ編集 / issue #25
--
-- 使い方
--   1. `CHANGE_ME@example.com` を Preview でログインする自分のメール（ユーザーA）に書き換える
--      RLS 確認用に `OTHER_USER@example.com` も別の確認済みユーザー（ユーザーB）に書き換える
--   2. Supabase Studio の SQL Editor に全文を貼って実行する
--   3. 確認が終わったら supabase/qa/l4_recipe_edit_cleanup.sql を実行して片付ける
--
-- 注意
--   - 手動実行専用。`supabase db reset` では流れない
--   - 本番データベースには投入しない
--   - タイトルは `【L4-Edit` で始まるので後片付けはタイトルで一括削除できる

insert into public.recipes
  (id, user_id, title, cooking_time_minutes, ingredients, steps, notes, created_at, updated_at)
select v.id, u.id, v.title, v.cooking_time_minutes, v.ingredients, v.steps, v.notes, v.ts, v.ts
from auth.users u
cross join (values
  -- 全項目入り。編集で既存値がフォームに入ることを確認
  (
    'e0000000-0000-4000-8000-000000000001'::uuid,
    '【L4-Edit-01】編集用・全部入り',
    30,
    $$じゃがいも 2個
玉ねぎ 1個$$,
    $$切る
煮る$$,
    $$編集前のメモ$$,
    now() - interval '2 days'
  ),
  -- タイトル以外が空。空欄プレフィルと「空にして保存」の確認用
  (
    'e0000000-0000-4000-8000-000000000002'::uuid,
    '【L4-Edit-02】タイトルのみ',
    null::int,
    null::text,
    null::text,
    null::text,
    now() - interval '1 day'
  ),
  -- 長い行。モバイルでフォームが横スクロールしないか
  (
    'e0000000-0000-4000-8000-000000000003'::uuid,
    '【L4-Edit-03】とても長いタイトルの編集確認用：モバイル幅で折り返してフォームが操作できるかどうかを見るための意図的に長いタイトルです',
    90,
    $$とても長い材料の行：これは横に長く続くテキストで、入力欄の折り返しとモバイルでの操作性を確認するためのものです$$,
    $$とても長い手順の行：同様に改行なしの長い1行がフォームと詳細の両方で破綻しないことを確認する$$,
    $$メモにも <b>タグ風</b> の文字列を入れて表示が崩れないことを見る$$,
    now() - interval '3 hours'
  )
) as v(id, title, cooking_time_minutes, ingredients, steps, notes, ts)
where u.email = 'CHANGE_ME@example.com'
on conflict (id) do nothing;

-- 他ユーザー行（ユーザーAが編集 URL を開いても見つからないこと）
insert into public.recipes
  (id, user_id, title, cooking_time_minutes, ingredients, steps, notes, created_at, updated_at)
select v.id, u.id, v.title, v.cooking_time_minutes, v.ingredients, v.steps, v.notes, v.ts, v.ts
from auth.users u
cross join (values
  (
    'e0000000-0000-4000-8000-000000000099'::uuid,
    '【L4-Edit-Other】他ユーザーの隠しレシピ',
    15,
    $$隠し材料$$,
    $$隠し手順$$,
    $$ユーザーB所有。ユーザーAの編集 URL では見つからないこと$$,
    now() - interval '5 days'
  )
) as v(id, title, cooking_time_minutes, ingredients, steps, notes, ts)
where u.email = 'OTHER_USER@example.com'
on conflict (id) do nothing;

select r.id, r.title, u.email as owner_email
from public.recipes r
join auth.users u on u.id = r.user_id
where r.title like '【L4-Edit%';
