## 技術スタック

### バックエンド
- Laravel 10.x
- PHP 8.2
- nginx
- MySQL 8.0

### フロントエンド
- Next.js 14.0
- React 18.2
- TypeScript 5.x
- Node.js 20

### 2. 環境変数の設定

環境変数ファイルをコピーして設定してください：

```bash
# ルートディレクトリ（Docker Compose用）
cp .env.example .env

# Laravel用
cp .env backend/.env

# Next.js用
cp .env frontend/.env.local
```

または、各ファイルを手動で作成することもできます。デフォルト値は既に`.env.example`ファイルに設定されています。

### 3. Laravelプロジェクトのセットアップ

```bash
# Dockerコンテナを起動
docker-compose up -d

# Laravelの依存関係をインストール
docker-compose exec laravel composer install

# アプリケーションキーの生成
docker-compose exec laravel php artisan key:generate

# マイグレーションの実行
docker-compose exec laravel php artisan migrate

# ストレージのシンボリックリンク作成
docker-compose exec laravel php artisan storage:link
```

### 4. Next.jsプロジェクトのセットアップ

```bash
# Next.jsの依存関係をインストール（コンテナ内で自動的に実行されます）
# または手動でインストールする場合：
docker-compose exec nextjs npm install
```

## 起動方法

```bash
# すべてのサービスを起動
docker-compose up -d

# ログを確認
docker-compose logs -f

# 特定のサービスのログを確認
docker-compose logs -f laravel
docker-compose logs -f nextjs
```

## アクセス

- **Next.js フロントエンド**: http://localhost:3000
- **Laravel API**: http://localhost:8000
- **Laravel API ヘルスチェック**: http://localhost:8000/api/health

## ディレクトリ構成

```
seeds-cursor-handson/
├── backend/              # Laravel プロジェクト
│   ├── app/             # アプリケーションコード
│   ├── config/          # 設定ファイル
│   ├── database/        # マイグレーション、シーダー
│   ├── public/          # 公開ディレクトリ
│   ├── routes/          # ルート定義
│   ├── .env.example     # 環境変数テンプレート
│   ├── Dockerfile       # Laravel用Dockerfile
│   └── nginx.conf       # nginx設定
├── frontend/            # Next.js プロジェクト
│   ├── app/            # App Router
│   ├── lib/            # ユーティリティ
│   ├── public/         # 静的ファイル
│   ├── .env.example    # 環境変数テンプレート
│   └── Dockerfile      # Next.js用Dockerfile
├── .env.example         # Docker Compose用環境変数テンプレート
├── docker-compose.yml   # Docker Compose設定
└── README.md           # このファイル
```

## 環境変数ファイル

プロジェクトには3つの`.env.example`ファイルがあります：

1. **ルート `.env.example`** - Docker Composeの設定（ポート番号、DB接続情報）
2. **`backend/.env.example`** - Laravel アプリケーションの設定
3. **`frontend/.env.example`** - Next.js アプリケーションの設定

各ファイルはデフォルト値で設定されているため、そのままコピーして使用できます。

