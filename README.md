# 空き家プロジェクト

## setup

### 地図データをプロジェクトに配置する

1. [chubu.pmtiles.zip](https://drive.google.com/file/d/1OKhf6Xsbd2nhwOT_A_LNGowJ3Tv4zpOj/view?usp=drive_link)をダウンロードする
2. 上記の zip ファイルを解凍して`chubu.pmtiles`を`app/assets`配下に配置する

## development

パッケージをインストールする

```
npm install
```

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
3. `app/drizzle/` 配下にマイグレーションファイルが生成されていれば OK

## E2Eテストの実行

- `npm run build`もしくは`npm run make --workspace=app`でビルド
- `npm run test:e2e --workspace`を実行
- テストは `tests/sample.e2e.ts` をコピーして作成すること。ファイル名は`*.e2e.ts`にすること（詳しくは playwright.config.ts を見てください）
