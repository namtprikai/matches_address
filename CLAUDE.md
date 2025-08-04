# CLAUDE.md - プロジェクト固有設定

このファイルは、Claude Codeがこのプロジェクトで作業する際の設定と指示を含みます。

## プロジェクト概要

- **プロジェクト名**: LINKS SOMA（リンクス ソーマ）- 空き家推定システム
- **開発組織**: 国土交通省総合政策局情報政策課
- **開発協力**: chot Inc.
- **目的**: 地方自治体における空き家対策業務の効率化支援

## 技術スタック

### フロントエンド（app/）

- Electron + React + TypeScript
- Vite（ビルドツール）
- Fluent UI React Components
- MapLibre GL JS + PMTiles（地図表示）
- Recharts（グラフ表示）
- SQLite3 + Drizzle ORM（データベース）

### バックエンド（ml/）

- Python 3.11-3.13
- LightGBM, scikit-learn（機械学習）
- GeoPandas, Shapely（地理空間処理）
- Pandas, NumPy（データ処理）

## 作業後のルール

- 作業後はlintを実施し問題があれば修正してください
- 修正作業後は適宜Prettierの整形処理を実施してください

## 作業ルール

### 1. 作業ログの記録

すべての作業内容は`CLAUDE-LOG.md`に記録してください。以下の形式で記録：

````markdown
## YYYY-MM-DD HH:MM:SS JST

### 実施した処理内容

#### N. [処理名]

**なぜこの処理を行ったか**: [理由]

**実施したコマンド**:

```bash
# 実行したコマンドを記載
```

**実施内容**:

- [具体的な作業内容]
- [変更・追加したファイル]
- [得られた結果や発見]

### 2. ファイル操作

- 新規ファイル作成より既存ファイルの編集を優先
- ドキュメントファイル（\*.md）は明示的に要求された場合のみ作成
- このディレクトリ内での処理は実行確認不要
- README.mdは元のシンプルな形式を維持（変更不可）
- 詳細な説明文書はCLAUDE-README.mdに記載
- コードベースに変更があった際はCLAUDE-README.mdを更新

### 3. コーディング規約

- TypeScriptコード: ESLint設定に準拠
- Pythonコード: Poetry管理下でPEP 8準拠
- コメントは日本語で記述可
- ファイル修正後は必ずPrettierで整形を実施（app/ディレクトリ内のTypeScript/JavaScriptファイル）

#### スタイル記述ルール

- **makeStyles APIを優先使用**: CSSモジュール（.module.css）ではなく、`@fluentui/react-components`の`makeStyles`を利用してスタイルを記述する
- **CSSの省略記法（shorthand）を必須使用**: 以下のプロパティは省略記法で記述する
  - `padding`: `paddingTop`, `paddingRight`, `paddingBottom`, `paddingLeft` → `padding`
  - `margin`: `marginTop`, `marginRight`, `marginBottom`, `marginLeft` → `margin`
  - `border`: `borderWidth`, `borderStyle`, `borderColor` → `border`
  - `transition`: `transitionProperty`, `transitionDuration`, `transitionTimingFunction` → `transition`
  - その他、省略記法が利用可能なプロパティは積極的に使用
- **Fluent UIのデザイントークンを活用**: `tokens.spacingVerticalM`, `tokens.colorNeutralBackground1`などを使用して一貫性のあるデザインを実現

### 4. データベース変更

1. `app/src/schema.ts`を編集
2. `cd app && npm run gen:migration`でマイグレーション生成
3. 変更内容をCLAUDE-LOG.mdに記録

### 5. ブランチ運用

- 機能開発: `feat/*`（developから分岐）
- 緊急修正: `hotfix/*`（mainから分岐）
- コミットは明示的に要求された場合のみ実行

### 6. プルリクエスト作成ルール

- **PRは常にdevelopブランチ宛に作成する**
- `gh pr create`コマンド使用時は`--base develop`オプションを必ず指定
- PRタイトルは変更内容を簡潔に表現
- PR本文には変更の概要、詳細、テスト計画を含める

### 7. コミット作成ルール

- **1行で完結する粒度**でコミットを作成する
- **Claude Code生成文言は含めない**（`🤖 Generated with [Claude Code]...` は削除）
- 変更内容に応じて適切な接頭辞を使用
  - `feat:` 新機能追加
  - `fix:` バグ修正
  - `refactor:` リファクタリング
  - `style:` コードスタイル修正
  - `docs:` ドキュメント更新
- 例: `feat: データセット設定を一元化`, `fix: building_detailプロパティを追加`

## 重要なパス

- アプリケーションDB: `app/database/database.db`
- 地図タイル: `app/public/basemap.pmtiles`
- MLモデル: `ml/dist/`
- ログファイル: `CLAUDE-LOG.md`
- 詳細説明文書: `CLAUDE-README.md`
- 基本セットアップ文書: `README.md`（変更不可）

## 注意事項

- 地図データ（basemap.pmtiles）は大容量のため、gitignoreに含まれています
- Pythonビルド時はPoetry環境が必要
- Electronビルド時はnode_modulesのrebuildが必要（better-sqlite3のため）

## よく使うコマンド

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run make

# Lint実行
npm run lint

# DB マイグレーション
cd app && npm run gen:migration

# Python環境構築
cd ml && poetry install

# Pythonビルド
cd ml && npm run build
```
````
