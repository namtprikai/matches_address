# 空き家プロジェクト

## 📦 セットアップ手順 / Setup Instructions

### 前提条件 / Prerequisites

wip

### 初回セットアップ / Initial Setup

**地図データをプロジェクトに配置する**

1. [chubu.zip](https://drive.google.com/file/d/1qcWQ8iWwOs6EDWb-5woPYP70C8fizJ3A/view?usp=drive_link)をダウンロードする
2. 上記の zip ファイルを解凍して`basemap.pmtiles`を`app/public`配下に配置する

**poetry をローカル環境にインストールする**

https://python-poetry.org/docs/#installation

**Pyinstaller をローカル環境にインストールする**

https://pyinstaller.org/en/stable/installation.html

※Pythonコードドキュメント

https://github.com/eukarya-inc/links-akiya/tree/01af2a1fed149b59ae40f00e8b1875862f4b321e/ml

### 開発サーバーの起動 / Start Development Server

**パッケージをインストールする**

```
npm install
```

**アプリの開発サーバーを立ち上げる**

```
npm run dev
```

## 🚀 ビルド方法 / Build

配布用のアプリをビルドする

```
npm run make
```

ビルドしたアプリは `app/out` に出力される

**Mac で `You have not agreed to the Xcode license agreements...` というエラーが出る場合**

ターミナルで以下のコマンドを実行して Xcode のライセンスに同意する

```
sudo xcodebuild -license
```

ライセンスに同意した後、再度ビルドコマンドを実行する

---

## 🪢 ブランチ運用ルール / Branching Strategy

このプロジェクトでは以下のブランチ戦略を採用しています：

| ブランチ名    | 説明                         |
|---------------|------------------------------|
| `main`        | 公開可能なソースコードを管理するブランチ      |
| `develop`     | 開発中の最新版（統合用）     |
| `feat/*`   | 機能ごとの開発ブランチ. Developブランチから作成する        |
| `hotfix/*`    | 緊急対応用ブランチ. mainブランチから作成する           |

- `feat/*` は `develop` へPR
- `hotfix/*` は `main` へ直接PR
- `main` ← `develop` はリリース時に実施

## 📦 リリース手順 / Release Process

※wip: 実際に対応してから修正加筆する

1. `develop` ブランチにすべての変更がマージされていることを確認
2. `main` ブランチにマージ
3. タグを作成
4. Github Actionsを実行し配布用アプリを作成

## 📁 ディレクトリ構成 / Directory Structure

```
project-root/
├── app             # Electronアプリルート
├── ml              # Pythonアプリルート
└── README.md
```

## 📝 補足 / Notes

**マイグレーションファイルの追加**

テーブルの追加やスキーマの変更が必要な場合、以下の手順を実行する

1. `app/src/schema.ts` を編集してスキーマを変更
2. `app/`配下で `npm run generate:migration` を実行しマイグレーションファイルを作成する
   ※既存スキーマの更新の際は上記のみだとエラーになることがあるため、`drizzle`フォルダを削除してから実行する([詳細](https://github.com/eukarya-inc/links-akiya/pull/13#discussion_r1694019271))
3. `app/drizzle/` 配下にマイグレーションファイルが生成されていれば OK




