# 空き家プロジェクト

## development

アプリの開発サーバーを立ち上げる

```
npm run dev
```

## build

配布用のアプリをビルドする

```
npm run make
```

結果は `app/out` に出力される

## マイグレーションファイルの追加

テーブルの追加やスキーマの変更が必要な場合、以下の手順を実行する

1. `app/src/schema.ts` を編集してスキーマを変更
2. `app/`配下で `npx drizzle-kit generate --dialect='sqlite' --schema=./src/schema.ts` を実行しマイグレーションファイルを作成する
3. `app/drizzle/` 配下にマイグレーションファイルが生成されていればOK
