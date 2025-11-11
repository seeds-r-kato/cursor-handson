# バックエンド（Laravel）コーディング規約

## 基本規約
- PSR-12に準拠したコーディングスタイルを使用
- `.php-cs-fixer.dist.php`の設定に従ってフォーマット
- UTF-8エンコーディングを使用

## 命名規則
### クラス
- PascalCase: `UserController`, `PaymentService`
- 単数形を使用: `Post` (×`Posts`)
- サフィックスは役割を示す: `Controller`, `Service`, `Repository`

### メソッド
- camelCase: `getUserById`, `calculateTotal`
- アクション名は動詞で開始: `create`, `update`, `delete`
- boolean値を返すメソッドは`is`, `has`, `can`で開始: `isValid`, `hasPermission`

### 変数
- camelCase: `$userId`, `$totalAmount`
- 説明的な名前を使用: `$customerEmail` (×`$email`)
- 配列は複数形: `$users`, `$orderItems`

## ドキュメンテーション
### PHPDoc
```php
/**
 * ユーザーの注文履歴を取得
 *
 * @param int $userId ユーザーID
 * @param array $options 検索オプション
 * @return Collection<Order>
 * @throws UserNotFoundException
 */
```

### コメント
- 複雑なロジックには日本語でコメントを記述
- TODO/FIXMEコメントには担当者と期限を記載

## データベース
### Eloquentモデル
- リレーション定義は必須
- スコープはクエリの再利用のために積極的に使用
- `fillable` の指定は必須

### マイグレーション
- テーブル名は複数形・スネークケース: `user_profiles`
- 外部キーは`{テーブル名}_id`: `user_id`
- タイムスタンプは`created_at`, `updated_at`を使用

## ビジネスロジック
### サービスクラス
- 単一責任の原則に従う
- トランザクションは`DB::transaction`で囲む
- 例外は適切にハンドリング
- ファサードは利用しない

### リポジトリパターン
- DBアクセスはリポジトリクラスに集約
- インターフェースと実装を分離
- キャッシュ戦略を実装

## セキュリティ
- ユーザー入力は必ずバリデーション
- SQLインジェクション対策としてEloquentまたはクエリビルダーを使用
- 機密情報は環境変数で管理

## テスト
- 機能テストは`tests/Feature`に配置
- 単体テストは`tests/Unit`に配置
- テストメソッド名は英語で具体的に記述

## エラーハンドリング
- カスタム例外クラスを作成して使用
- ログレベルを適切に設定
- ユーザーフレンドリーなエラーメッセージを返却 