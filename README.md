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
2. `app/`配下で `npm run generate:migration` を実行しマイグレーションファイルを作成する
   ※既存スキーマの更新の際は上記のみだとエラーになることがあるため、`drizzle`フォルダを削除してから実行する([詳細](https://github.com/eukarya-inc/links-akiya/pull/13#discussion_r1694019271))
3. `app/drizzle/` 配下にマイグレーションファイルが生成されていればOK
