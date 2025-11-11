# リグレッションテストレビューコマンド

@Branch (Diff with Main Branch)を利用して
ローカルの master ブランチからの変更内容を徹底的に把握し、既存機能に破壊的な影響を与える変更が無いか確認します。

## 実行手順

### 1. masterブランチとの差分を確認

```bash
# 現在のブランチとmasterブランチの差分を確認
git diff master --name-status

# 変更されたファイルの詳細な差分を確認
git diff master

# 変更されたファイルのリストを取得
git diff master --name-only
```

### 2. APIエンドポイントの破壊的変更チェック

#### 2.1 エンドポイントの削除・変更
```bash
# APIルートファイルの変更を確認
git diff master backend/routes/api.php

# エンドポイントの削除を確認（Route::get|post|put|delete|patch の削除）
git diff master backend/routes/api.php | grep -E "^\-.*Route::(get|post|put|delete|patch)"

# エンドポイントのパス変更を確認
git diff master backend/routes/api.php | grep -E "(Route::|'/api/)"
```

#### 2.2 HTTPメソッドの変更
```bash
# HTTPメソッドの変更（例: GET → POST）を確認
git diff master backend/routes/api.php | grep -E "^\+.*Route::|^\-.*Route::"
```

#### 2.3 認証・認可ミドルウェアの変更
```bash
# 認証ミドルウェアの削除や変更を確認
git diff master backend/routes/api.php | grep -E "(auth:sanctum|middleware)"

# 公開エンドポイントが認証必須に変更されていないか確認
git diff master backend/routes/api.php | grep -E "^\+.*Route::.*auth:sanctum" | grep -vE "(user|logout|search)"
```

#### 2.4 レート制限の変更
```bash
# レート制限の削除や変更を確認
git diff master backend/routes/api.php | grep -E "(throttle|rate.*limit)"

# レート制限値の変更を確認（30 req/min から変更されていないか）
git diff master backend/routes/api.php | grep -E "throttle:" | grep -v "throttle:30"
```

### 3. APIレスポンス形式の破壊的変更チェック

#### 3.1 認証APIのレスポンス構造変更
```bash
# AuthControllerのレスポンス構造変更を確認
git diff master backend/app/Http/Controllers/AuthController.php | grep -E "(response\(\)->json|return.*json)"

# 必須フィールド（user, token, message）の削除を確認
git diff master backend/app/Http/Controllers/AuthController.php | grep -E "^\-.*(user|token|message)"
```

#### 3.2 画像検索APIのレスポンス構造変更
```bash
# ImageSearchControllerのレスポンス構造変更を確認
git diff master backend/app/Http/Controllers/ImageSearchController.php | grep -E "(response\(\)->json|return.*json)"

# 必須フィールド（total, totalHits, hits）の削除を確認
git diff master backend/app/Http/Controllers/ImageSearchController.php | grep -E "^\-.*(total|totalHits|hits)"

# hits配列内の必須フィールドの削除を確認
git diff master backend/app/Http/Controllers/ImageSearchController.php | grep -E "^\-.*(id|pageURL|tags|previewURL|webformatURL|largeImageURL|user)"
```

#### 3.3 エラーレスポンス形式の変更
```bash
# エラーレスポンス構造の変更を確認
git diff master backend/app/Http/Controllers | grep -E "(error|Error|exception|Exception)" | grep -E "(response|json)"
```

### 4. リクエストパラメータの破壊的変更チェック

#### 4.1 必須パラメータの追加
```bash
# バリデーションルールの変更を確認
git diff master backend/app/Http/Controllers | grep -E "(validate|rules)" | grep -E "(required|sometimes)"

# 必須パラメータの追加を確認（sometimes → required）
git diff master backend/app/Http/Controllers | grep -E "^\+.*required" | grep -vE "^\+.*required\|string"
```

#### 4.2 パラメータ名の変更
```bash
# パラメータ名の変更を確認
git diff master backend/app/Http/Controllers | grep -E "(request->|validated\[|'q'|'email'|'password'|'name'|'per_page'|'order'|'safesearch')"
```

#### 4.3 バリデーションルールの厳格化
```bash
# バリデーションルールの変更を確認
git diff master backend/app/Http/Controllers | grep -E "(min:|max:|email|string|integer)"

# パスワードの最小文字数の変更
git diff master backend/app/Http/Controllers/AuthController.php | grep -E "password.*min:"
```

### 5. データベーススキーマの破壊的変更チェック

#### 5.1 マイグレーションファイルの変更
```bash
# マイグレーションファイルの変更を確認
git diff master backend/database/migrations

# カラムの削除を確認
git diff master backend/database/migrations | grep -E "^\-.*\$table->(string|integer|text|boolean|timestamp)"

# カラム名の変更を確認
git diff master backend/database/migrations | grep -E "(->renameColumn|->change)"
```

#### 5.2 モデルの変更
```bash
# Userモデルの変更を確認
git diff master backend/app/Models/User.php

# フィル可能フィールド（fillable）の変更を確認
git diff master backend/app/Models/User.php | grep -E "(fillable|guarded)"
```

### 6. フロントエンドとの互換性チェック

#### 6.1 APIクライアントの変更
```bash
# フロントエンドのAPIクライアントの変更を確認
git diff master frontend/lib/api.ts

# エンドポイントURLの変更を確認
git diff master frontend/lib/api.ts | grep -E "(/api/|endpoint|baseURL)"
```

#### 6.2 API呼び出しの変更
```bash
# フロントエンドでのAPI呼び出しの変更を確認
git diff master frontend/lib/hooks | grep -E "(api\.(get|post|put|delete)|/api/)"

# 認証フックの変更を確認
git diff master frontend/lib/hooks/useAuth.ts

# 画像検索フックの変更を確認
git diff master frontend/lib/hooks/useImageSearch.ts
```

#### 6.3 レスポンスデータの使用箇所の変更
```bash
# フロントエンドコンポーネントでのレスポンスデータ使用の変更を確認
git diff master frontend/components | grep -E "(\.user|\.token|\.hits|\.total|\.totalHits)"
```

### 7. 認証・認可の破壊的変更チェック

#### 7.1 認証トークンの形式変更
```bash
# トークン生成方法の変更を確認
git diff master backend/app/Http/Controllers/AuthController.php | grep -E "(createToken|plainTextToken)"

# トークン検証方法の変更を確認
git diff master backend/config/sanctum.php
```

#### 7.2 認証ミドルウェアの変更
```bash
# 認証ミドルウェアの変更を確認
git diff master backend/app/Http/Kernel.php | grep -E "(auth|sanctum)"
```

### 8. 設定ファイルの破壊的変更チェック

#### 8.1 CORS設定の変更
```bash
# CORS設定の変更を確認
git diff master backend/config/cors.php

# 許可されるオリジンの変更を確認
git diff master backend/config/cors.php | grep -E "(allowedOrigins|allowed_origins)"
```

#### 8.2 キャッシュ設定の変更
```bash
# キャッシュ設定の変更を確認
git diff master backend/config/cache.php

# Redis設定の変更を確認
git diff master backend/config/cache.php | grep -i "redis"
```

### 9. エラーハンドリングの破壊的変更チェック

#### 9.1 HTTPステータスコードの変更
```bash
# HTTPステータスコードの変更を確認
git diff master backend/app/Http/Controllers | grep -E "(response\(\)->json.*,|status\(\)|201|200|400|401|403|404|500)"
```

#### 9.2 エラーメッセージの変更
```bash
# エラーメッセージの変更を確認（フロントエンドが依存している可能性がある）
git diff master backend/app/Http/Controllers | grep -E "(error|Error|message|Message)" | grep -E "(json|response)"
```

### 10. 依存関係の破壄的変更チェック

#### 10.1 Composer依存関係の変更
```bash
# composer.jsonの変更を確認
git diff master backend/composer.json

# メジャーバージョンの変更を確認（破壊的変更の可能性）
git diff master backend/composer.json | grep -E "^\+.*\"[0-9]+\.[0-9]+\.[0-9]+\"|^\-.*\"[0-9]+\.[0-9]+\.[0-9]+\""
```

#### 10.2 npm依存関係の変更
```bash
# package.jsonの変更を確認
git diff master frontend/package.json

# メジャーバージョンの変更を確認
git diff master frontend/package.json | grep -E "^\+.*\"[0-9]+\.[0-9]+\.[0-9]+\"|^\-.*\"[0-9]+\.[0-9]+\.[0-9]+\""
```

### 11. 環境変数の破壄的変更チェック

#### 11.1 必須環境変数の追加
```bash
# 環境変数の使用箇所の変更を確認
git diff master backend | grep -E "(env\(|config\(|getenv)" | grep -vE "(\.env|\.example)"

# 新しい環境変数の使用を確認
git diff master backend | grep -E "^\+.*env\("
```

### 12. 既存機能の削除チェック

#### 12.1 コントローラーメソッドの削除
```bash
# コントローラーメソッドの削除を確認
git diff master backend/app/Http/Controllers | grep -E "^\-.*function (register|login|logout|user|search)"
```

#### 12.2 フロントエンド機能の削除
```bash
# フロントエンドページの削除を確認
git diff master frontend/app | grep -E "^\-.*page\.tsx|^\-.*route\.ts"

# コンポーネントの削除を確認
git diff master frontend/components | grep -E "^\-.*\.tsx"
```

## チェックリスト

以下の項目を手動で確認してください：

### APIエンドポイント
- [ ] 既存のAPIエンドポイントが削除されていない
- [ ] エンドポイントのパスが変更されていない
- [ ] HTTPメソッド（GET/POST/PUT/DELETE）が変更されていない
- [ ] 認証・認可の要件が変更されていない（公開→認証必須など）
- [ ] レート制限の設定が変更されていない（30 req/min）

### APIレスポンス
- [ ] レスポンスのJSON構造が変更されていない
- [ ] 必須フィールド（user, token, message, total, totalHits, hits）が削除されていない
- [ ] レスポンスフィールドの型が変更されていない（string → numberなど）
- [ ] エラーレスポンスの形式が変更されていない

### リクエストパラメータ
- [ ] 必須パラメータが追加されていない（既存のクライアントが壊れる）
- [ ] パラメータ名が変更されていない
- [ ] バリデーションルールが厳格化されていない（既存の有効なリクエストが拒否される）

### データベース
- [ ] マイグレーションでカラムが削除されていない
- [ ] カラム名が変更されていない
- [ ] カラムの型が変更されていない（互換性のない変更）

### フロントエンド互換性
- [ ] フロントエンドが使用しているAPIエンドポイントが変更されていない
- [ ] フロントエンドが期待するレスポンス構造が変更されていない
- [ ] 認証トークンの形式が変更されていない

### 認証・認可
- [ ] 認証トークンの生成・検証方法が変更されていない
- [ ] 認証ミドルウェアの動作が変更されていない

### 設定
- [ ] CORS設定が変更されていない（フロントエンドからのアクセスが拒否されないか）
- [ ] キャッシュ設定が変更されていない

### エラーハンドリング
- [ ] HTTPステータスコードが変更されていない
- [ ] エラーメッセージの形式が変更されていない（フロントエンドが依存している可能性）

### 依存関係
- [ ] メジャーバージョンのアップグレードがない（破壊的変更の可能性）
- [ ] 削除されたパッケージがない

### 環境変数
- [ ] 必須環境変数が追加されていない（既存の環境で動作しなくなる）

### 機能削除
- [ ] 既存の機能が削除されていない
- [ ] フロントエンドのページやコンポーネントが削除されていない

## 重要な注意事項

1. **すべての変更ファイルを確認**: 特にAPIルート、コントローラー、モデル、マイグレーション、フロントエンドのAPI呼び出し部分は重点的に確認してください。

2. **フロントエンドとの整合性**: バックエンドの変更がフロントエンドの実装と整合しているか確認してください。

3. **後方互換性**: 既存のクライアント（フロントエンド）が動作し続けるか確認してください。

4. **段階的な変更**: 破壄的変更が必要な場合は、新しいエンドポイントを追加し、既存のエンドポイントを非推奨（deprecated）として残すことを検討してください。

5. **テストの実行**: 変更後は必ず手動テストまたは自動テストを実行して、既存機能が正常に動作することを確認してください。

## レビュー結果の記録

発見した問題は以下の形式で記録してください：

```
## リグレッションテストレビュー結果

### 日付: YYYY-MM-DD
### レビュアー: [名前]
### ブランチ: [ブランチ名]

### 発見された破壄的変更

1. **重大度: 高/中/低**
   - 変更内容の説明
   - 影響を受ける機能・エンドポイント
   - 既存クライアントへの影響
   - 推奨される対応方法

### 確認済み項目
- [ ] APIエンドポイント
- [ ] APIレスポンス
- [ ] リクエストパラメータ
- [ ] データベース
- [ ] フロントエンド互換性
- [ ] 認証・認可
- [ ] 設定
- [ ] エラーハンドリング
- [ ] 依存関係
- [ ] 環境変数
- [ ] 機能削除
```

## 追加のテスト手順

### 手動テスト（推奨）

1. **認証フローのテスト**
   ```bash
   # ユーザー登録
   curl -X POST http://localhost:8000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
   
   # ログイン
   curl -X POST http://localhost:8000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123"}'
   
   # ユーザー情報取得（トークンを使用）
   curl -X GET http://localhost:8000/api/auth/user \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

2. **画像検索APIのテスト**
   ```bash
   # 画像検索（トークンを使用）
   curl -X GET "http://localhost:8000/api/search/images?q=cat&per_page=20&order=latest&safesearch=false" \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

3. **フロントエンドの動作確認**
   - ブラウザで http://localhost:3000 にアクセス
   - ユーザー登録 → ログイン → 画像検索のフローを実行
   - 各機能が正常に動作することを確認

### 自動テスト（オプション）

```bash
# Laravelのテストを実行（存在する場合）
cd backend && php artisan test

# フロントエンドのテストを実行（存在する場合）
cd frontend && npm test
```

