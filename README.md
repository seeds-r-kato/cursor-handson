# Pixabay画像検索アプリ

Pixabay APIを使用した画像検索Webアプリケーションです。

## 機能

- ユーザー登録・ログイン（Laravel Sanctum認証）
- Pixabay APIを使用した画像検索（最大20件）
- レスポンシブな画像グリッド表示
- 画像詳細モーダル（作者、解像度、タグ、統計情報）
- Redisキャッシュによる高速化
- レート制限（30 req/min）

## 技術スタック

### バックエンド
- Laravel 10.x
- PHP 8.2
- nginx
- MySQL 8.0
- Redis 7
- Laravel Sanctum（認証）

### フロントエンド
- Next.js 14.0（App Router）
- React 18.2
- TypeScript 5.x
- Tailwind CSS
- TanStack Query（React Query）
- Node.js 20

## セットアップ

### 1. 環境変数の設定

#### Docker Compose用（ルートディレクトリ）
```bash
cp .env.example .env
```

#### Laravel用（backend/.env）
```bash
cp backend/.env.example backend/.env
```

`backend/.env`に以下を追加：
```env
PIXABAY_API_KEY=your_pixabay_api_key_here
REDIS_HOST=redis
REDIS_PORT=6379
CACHE_DRIVER=redis
```

#### Next.js用（frontend/.env.local）
```bash
cp frontend/.env.example frontend/.env.local
```

`frontend/.env.local`に以下を追加：
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### 2. Pixabay APIキーの取得

1. [Pixabay](https://pixabay.com/api/docs/)にアクセス
2. アカウントを作成（無料）
3. APIキーを取得
4. `backend/.env`の`PIXABAY_API_KEY`に設定

### 3. Dockerコンテナの起動

```bash
# すべてのサービスを起動
docker-compose up -d

# ログを確認
docker-compose logs -f
```

### 4. Laravelプロジェクトのセットアップ

```bash
# Laravelの依存関係をインストール
docker-compose exec laravel composer install

# アプリケーションキーの生成
docker-compose exec laravel php artisan key:generate

# Sanctumの設定を公開
docker-compose exec laravel php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"

# マイグレーションの実行
docker-compose exec laravel php artisan migrate

# キャッシュのクリア
docker-compose exec laravel php artisan config:clear
docker-compose exec laravel php artisan cache:clear
```

### 5. Next.jsプロジェクトのセットアップ

```bash
# Next.jsの依存関係をインストール
cd frontend
npm install

# 開発サーバーを起動（別ターミナル）
npm run dev
```

または、Dockerコンテナ内で実行する場合：
```bash
docker-compose exec frontend npm install
```

## 起動方法

### 開発環境

```bash
# バックエンド（Docker）
docker-compose up -d

# フロントエンド（ローカル）
cd frontend
npm run dev
```

### アクセス

- **Next.js フロントエンド**: http://localhost:3000
- **Laravel API**: http://localhost:8000
- **Laravel API ヘルスチェック**: http://localhost:8000/api/health

## APIエンドポイント

### 認証
- `POST /api/auth/register` - ユーザー登録
- `POST /api/auth/login` - ログイン
- `POST /api/auth/logout` - ログアウト（認証必要）
- `GET /api/auth/user` - 現在のユーザー情報（認証必要）

### 画像検索
- `GET /api/search/images?q={keyword}&per_page=20&order=latest&safesearch=false` - 画像検索（認証必要、レート制限: 30 req/min）

## ディレクトリ構成

```
seeds-cursor-handson/
├── backend/              # Laravel プロジェクト
│   ├── app/
│   │   ├── Http/
│   │   │   └── Controllers/
│   │   │       ├── AuthController.php      # 認証コントローラー
│   │   │       └── ImageSearchController.php # 画像検索コントローラー
│   │   └── Models/
│   │       └── User.php                    # Userモデル
│   ├── config/
│   │   ├── auth.php                        # 認証設定
│   │   ├── cache.php                       # キャッシュ設定
│   │   ├── cors.php                        # CORS設定
│   │   ├── sanctum.php                     # Sanctum設定
│   │   └── services.php                    # 外部サービス設定
│   ├── database/
│   │   └── migrations/
│   │       └── 2024_01_01_000001_create_users_table.php
│   ├── routes/
│   │   └── api.php                         # APIルート
│   └── .env.example
├── frontend/            # Next.js プロジェクト
│   ├── app/
│   │   ├── login/                          # ログインページ
│   │   ├── register/                       # 登録ページ
│   │   ├── search/                         # 検索ページ
│   │   ├── layout.tsx                      # ルートレイアウト
│   │   ├── page.tsx                        # ホームページ
│   │   └── providers.tsx                   # TanStack Queryプロバイダー
│   ├── components/
│   │   ├── ImageCard.tsx                   # 画像カードコンポーネント
│   │   ├── ImageGrid.tsx                   # 画像グリッドコンポーネント
│   │   └── ImageModal.tsx                  # 画像詳細モーダル
│   ├── lib/
│   │   ├── api.ts                          # APIクライアント
│   │   └── hooks/
│   │       ├── useAuth.ts                  # 認証フック
│   │       └── useImageSearch.ts           # 画像検索フック
│   └── .env.example
├── docker-compose.yml   # Docker Compose設定
└── README.md
```

## 主な実装内容

### バックエンド

1. **認証システム**
   - Laravel Sanctumを使用したトークンベース認証
   - ユーザー登録・ログイン・ログアウト機能

2. **画像検索API**
   - Pixabay APIとの統合
   - Redisキャッシュ（10分TTL）
   - レート制限（30 req/min）
   - エラーハンドリングとリトライ機能

3. **データベース**
   - usersテーブル（id, name, email, password, timestamps）

### フロントエンド

1. **認証機能**
   - 登録・ログインページ
   - 認証状態管理（TanStack Query）
   - トークン管理（localStorage）

2. **検索機能**
   - レスポンシブな検索バー
   - 画像グリッド表示（モバイル2列、タブレット3列、デスクトップ4-6列）
   - スケルトンローディング
   - エラー表示と再試行機能

3. **画像詳細モーダル**
   - 画像拡大表示
   - メタ情報表示（作者、解像度、タグ、統計）
   - Pixabayへのリンク
   - キーボード操作対応（ESCキーで閉じる）

## 開発

### バックエンドのテスト

```bash
docker-compose exec laravel php artisan test
```

### フロントエンドのlint

```bash
cd frontend
npm run lint
```

## トラブルシューティング

### Redis接続エラー

`backend/.env`で以下を確認：
```env
REDIS_HOST=redis
REDIS_PORT=6379
CACHE_DRIVER=redis
```

### CORSエラー

`backend/config/cors.php`でNext.jsのオリジンが許可されているか確認：
```php
'allowed_origins' => [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
],
```

### Pixabay APIエラー

`backend/.env`でAPIキーが正しく設定されているか確認：
```env
PIXABAY_API_KEY=your_api_key_here
```

## ライセンス

MIT
