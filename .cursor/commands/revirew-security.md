# セキュリティレビューコマンド

@Branch (Diff with Main Branch)を利用して
ローカルの master ブランチからの変更内容を徹底的に把握し、クリティカルな脆弱性が含まれていないか確認します。

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

### 2. 機密情報の漏洩チェック

以下のパターンがコードに含まれていないか確認してください：

#### 2.1 APIキー、トークン、シークレットのハードコーディング
```bash
# 一般的なシークレットパターンを検索
git diff master | grep -iE "(api[_-]?key|secret|token|password|pwd|credential|auth[_-]?key)" | grep -vE "(\.env|\.example|\.gitignore|Hash::|password_hash)"

# Pixabay APIキーの直接記述をチェック
git diff master | grep -i "pixabay" | grep -vE "(\.env|\.example|config/services\.php)"

# 認証トークンのハードコーディング
git diff master | grep -E "(bearer|token|jwt)" | grep -vE "(\.env|\.example|sanctum|auth_token)"
```

#### 2.2 環境変数ファイルのコミット漏洩
```bash
# .envファイルがコミットされていないか確認
git diff master --name-only | grep -E "\.env$|\.env\.local$|\.env\."

# .gitignoreに.envが含まれているか確認
git diff master .gitignore | grep -E "\.env"
```

#### 2.3 データベース接続情報の漏洩
```bash
# データベース接続文字列のハードコーディング
git diff master | grep -iE "(mysql|postgres|database|db[_-]?host|db[_-]?password|db[_-]?user)" | grep -vE "(\.env|\.example|config/database\.php|DB_|env\()"
```

### 3. 認証・認可の脆弱性チェック

#### 3.1 認証バイパスの可能性
```bash
# 認証ミドルウェアが適切に適用されているか確認
git diff master backend/routes/api.php | grep -E "(Route::|middleware)" | grep -vE "(auth:sanctum|throttle)"

# 認証不要なエンドポイントの追加を確認
git diff master backend/routes/api.php | grep -E "Route::(get|post|put|delete|patch)" | grep -v "middleware"
```

#### 3.2 パスワード管理の問題
```bash
# パスワードの平文保存や弱いハッシュ関数の使用
git diff master | grep -iE "(password|pwd)" | grep -vE "(Hash::make|bcrypt|password_hash|hashed|\.env)"
```

#### 3.3 セッション管理の問題
```bash
# セッション設定の変更を確認
git diff master backend/config/session.php

# セッション暗号化の無効化
git diff master backend/config/session.php | grep -i "encrypt.*false"
```

### 4. SQLインジェクション脆弱性チェック

```bash
# 生のSQLクエリの使用（Eloquent ORM以外）
git diff master backend/app | grep -E "(DB::raw|DB::select|DB::statement|->whereRaw|->selectRaw)" | grep -vE "(//|/\*)"

# ユーザー入力が直接SQLに含まれていないか確認
git diff master backend/app/Http/Controllers | grep -E "(\$request->|Input::|request\()" | grep -E "(DB::|whereRaw|selectRaw)"
```

### 5. XSS（クロスサイトスクリプティング）脆弱性チェック

```bash
# フロントエンドでの危険なHTML挿入
git diff master frontend | grep -E "(dangerouslySetInnerHTML|innerHTML|\.html\(|document\.write)" | grep -vE "(//|/\*)"

# エスケープされていないユーザー入力の表示
git diff master frontend | grep -E "(\{.*\})" | grep -vE "(//|/\*|className|style|key=)"
```

### 6. CSRF（クロスサイトリクエストフォージェリ）対策の確認

```bash
# CSRF保護の無効化
git diff master backend/app/Http/Middleware | grep -i "csrf" | grep -i "except\|disable"

# VerifyCsrfTokenミドルウェアの変更
git diff master backend/app/Http/Middleware/VerifyCsrfToken.php
```

### 7. CORS設定の確認

```bash
# CORS設定の変更を確認（過度に緩い設定がないか）
git diff master backend/config/cors.php

# すべてのオリジンを許可する設定
git diff master backend/config/cors.php | grep -iE "(allowedOrigins.*\*|'origin' => '\*')"
```

### 8. レート制限の確認

```bash
# レート制限の削除や緩和
git diff master backend/routes/api.php | grep -E "(throttle|rate.*limit)" | grep -vE "(throttle:30)"
```

### 9. ファイルアップロードの脆弱性チェック

```bash
# ファイルアップロード機能の追加
git diff master | grep -iE "(upload|file|storeAs|putFile)" | grep -vE "(//|/\*)"

# ファイルタイプの検証がない場合
git diff master backend/app/Http/Controllers | grep -i "upload" | grep -vE "(mimes:|mimeTypes:|validate)"
```

### 10. 依存関係の脆弱性チェック

```bash
# composer.jsonの変更を確認
git diff master backend/composer.json

# package.jsonの変更を確認
git diff master frontend/package.json

# 既知の脆弱性があるパッケージの追加を確認
# （手動で確認が必要）
```

### 11. エラーハンドリングと情報漏洩

```bash
# デバッグモードの有効化
git diff master backend/config/app.php | grep -i "APP_DEBUG.*true"

# スタックトレースの露出
git diff master backend/app/Exceptions/Handler.php | grep -iE "(report|render)" | grep -vE "(//|/\*)"

# エラーメッセージに機密情報が含まれていないか
git diff master | grep -iE "(error|exception|throw)" | grep -iE "(password|token|key|secret)"
```

### 12. 入力検証の確認

```bash
# バリデーションルールの削除や緩和
git diff master backend/app/Http/Controllers | grep -E "(validate|rules)" | grep -vE "(required|email|string|min:|max:)"
```

### 13. ログに機密情報が記録されていないか

```bash
# ログ出力にパスワードやトークンが含まれていないか
git diff master | grep -iE "(Log::|logger|error_log)" | grep -iE "(password|token|key|secret|credential)"
```

### 14. セキュリティヘッダーの確認

```bash
# セキュリティヘッダーの設定変更
git diff master backend/app/Http/Middleware | grep -iE "(header|X-|Content-Security-Policy|X-Frame-Options)"
```

### 15. Docker設定のセキュリティ確認

```bash
# Dockerfileの変更を確認
git diff master Dockerfile backend/Dockerfile frontend/Dockerfile

# 機密情報の環境変数としての渡し方
git diff master docker-compose.yml | grep -iE "(environment|env_file)" | grep -iE "(password|key|secret|token)"
```

## チェックリスト

以下の項目を手動で確認してください：

- [ ] masterブランチとの差分を確認済み
- [ ] 機密情報（APIキー、パスワード、トークン）がハードコーディングされていない
- [ ] .envファイルがコミットされていない
- [ ] 認証が必要なエンドポイントに適切にミドルウェアが適用されている
- [ ] パスワードは適切にハッシュ化されている（Hash::make使用）
- [ ] SQLインジェクションの脆弱性がない（Eloquent ORM使用、生SQLの適切なエスケープ）
- [ ] XSS対策がされている（Reactのデフォルトエスケープ、dangerouslySetInnerHTMLの適切な使用）
- [ ] CSRF保護が有効になっている
- [ ] CORS設定が適切（必要最小限のオリジンのみ許可）
- [ ] レート制限が適切に設定されている
- [ ] 入力検証が適切に実装されている
- [ ] エラーメッセージに機密情報が含まれていない
- [ ] ログに機密情報が記録されていない
- [ ] 依存関係に既知の脆弱性がない（composer audit、npm auditを実行）
- [ ] Docker設定にセキュリティ上の問題がない

## 追加のセキュリティチェックツール

### Composer依存関係の脆弱性チェック
```bash
cd backend && composer audit
```

### npm依存関係の脆弱性チェック
```bash
cd frontend && npm audit
```

### 静的解析ツール（オプション）
```bash
# PHP静的解析（例：PHPStan、Psalm）
# Laravel Pintによるコードスタイルチェック
cd backend && ./vendor/bin/pint --test
```

## 重要な注意事項

1. **すべての変更ファイルを確認**: 特に認証、認可、データベース操作、ファイル操作に関連するファイルは重点的に確認してください。

2. **外部APIの使用**: Pixabay APIキーが適切に環境変数で管理されているか確認してください。

3. **認証トークン**: Laravel Sanctumのトークンが適切に管理されているか確認してください。

4. **レート制限**: APIエンドポイントに適切なレート制限が設定されているか確認してください。

5. **エラーハンドリング**: 本番環境でデバッグ情報が露出しないよう確認してください。

## レビュー結果の記録

発見した問題は以下の形式で記録してください：

```
## セキュリティレビュー結果

### 日付: YYYY-MM-DD
### レビュアー: [名前]
### ブランチ: [ブランチ名]

### 発見された問題

1. **重大度: 高/中/低**
   - 問題の説明
   - 影響範囲
   - 推奨される修正方法

### 確認済み項目
- [ ] 項目1
- [ ] 項目2
```

