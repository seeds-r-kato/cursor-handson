# Pixabay画像検索アプリ 要件定義ドラフト（v0.1）

---

## 0. ゴール / 概要

* ログイン済みユーザーが、検索キーワードから **Pixabay API** を用いて画像を取得し、一覧表示するWebアプリ。
* 表示は最大20枚/1検索。
* 技術スタック：**Laravel(PHP 8.2) + MySQL + nginx**、フロントは **Next.js(React) + Tailwind CSS**、Node 20。

---

## 1. ユースケース / ユーザーストーリー

* U1: ユーザーは**自由登録**でアカウントを作成し、ログイン後に検索画面へ遷移する（パスワードリセットなし／IdP連携なし）。
* U2: ユーザーは検索欄にキーワードを入力し、検索を実行する。
* U3: システムはPixabay APIから該当画像を取得し、**最大20件**をグリッド表示する。
* U4: ユーザーは画像をクリックして**モーダル**で拡大/詳細（作者、解像度、タグ、出典リンク等）を確認できる。

---

## 2. 画面要件（初版）

### 2.1 認証

* 自由登録（メール+パスワード）。
* パスワードリセット：**なし**。
* IdP(Google/Microsoft)連携：**不要**。

### 2.2 検索画面

* 上部に検索バー、実行ボタン。
* 結果はレスポンシブなカードグリッド（モバイル2列、タブレット3列、デスクトップ4〜6列）。
* 1回の検索で**最大20枚**表示（上限固定）。
* 画像カード要素（サムネイル、作者名、Pixabayへのリンク、タグ）。
* クリックで**モーダル**詳細（大きめ画像・メタ情報・ダウンロード/出典リンク）。
* 既定パラメータ：`order=latest`、`safesearch=false`。
* **追加フィルタ（orientation/category/color）は実装しない**。

### 2.3 （削除）マイページ

* お気に入り/検索履歴は**スコープ外**。
  マイページ（任意）
* お気に入り画像一覧。
* 自分の検索履歴。

---

## 3. バックエンド/API設計（確定初版）

* Next.jsはフロントUI、**Pixabay呼び出しはLaravel API経由**（APIキー保護）。
* エンドポイント（v1想定）

  * `POST /api/auth/register` / `POST /api/auth/login` / `POST /api/auth/logout`
  * `GET /api/search/images?q=...&per_page=20&order=latest&safesearch=false`
* 認証方式：Laravel **Sanctum**（推奨・SPA想定）。
* レート制限：`/api/search/images` をユーザー単位で **30 req/min**（初期値）。
* キャッシュ：キーワード+パラメータで **Redis** に **5〜15分** TTL（初期:10分）
* CORS：Next.jsオリジンのみ許可。

---

## 4. フロントエンド構成（案）

* Next.js App Router、TypeScript（推奨）。
* スタイリング：Tailwind CSS。
* データ取得：React Query（TanStack Query） or fetch + SWR（推奨: TanStack Query）。
* UI要素：カード、モーダル、スケルトンローディング、エラー表示（再試行ボタン）。
* アクセシビリティ（キーボード操作、aria属性、コントラスト）。

---

## 5. データモデル（初期）

* `users`：id, name, email, password_hash, timestamps。
* `api_call_logs`（任意）：id, user_id, endpoint, query, status, latency_ms, created_at。

---

## 6. 外部API（Pixabay）利用方針

* APIキーはLaravel側 `.env` 管理。
* 既定呼び出し：`per_page=20`、`order=latest`、`safesearch=false`。
* 著作権/帰属表記：詳細モーダルに出典リンク明記（ダウンロード導線はPixabay外部リンク）。
* 失敗時リトライ、タイムアウト（例: 5s）。

---

## 7. 非機能要件

* パフォーマンス：初回検索<1.5s（キャッシュ時<500ms）を目標。
* 可用性：単一AZ前提（将来拡張可）。
* セキュリティ：環境変数管理、CORS制御。
* ログ/監視：**特別な連携は不要**（Laravel標準ログのみ／将来拡張可）。

---

## 8. 環境/デプロイ

* 環境：**dev / prod** の最小構成。
* インフラ：nginx（リバプロ）、Laravel(PHP-FPM)、Next.js（静的 or SSR）をDocker化。
* Redis：**導入**（キャッシュ用途）。
* CI/CD：GitHub Actions（lint/test/build/deploy）。

---

## 9. テスト/品質

* 単体テスト（PHPUnit、Vitest/RTL）。
* 結合テスト（API E2E: Pest + HTTP tests / Playwright）。
* 負荷テスト（k6）任意。

---

## 10. スコープ外（初期）

* お気に入り保存、検索履歴。
* 画像の自前アップロード/変換。
* 課金/従量課金管理。
* コレクション共有/チーム機能。

---

## 11. リスク/懸念

* Pixabay APIレートリミットに到達する可能性 → キャッシュ/ダウンサンプリング。
* 著作権・ライセンス誤解 → UIで権利表示を明確に。

---

## 12. スケジュール概算（ドラフト）

* 週次マイルストーン：

  * W1: 骨組み（Auth/検索API/検索画面・モーダル/Redisキャッシュ）
  * W2: UI仕上げ/アクセシビリティ/エラーハンドリング
  * W3: 監査ログ・軽負荷試験
  * W4: 受入/微修正/リリース

---

## 13. 確認したい事項（未回答）

* なし（頂いた回答で現時点は確定）。

---

## 14. 受入基準（更新）

* 自由登録でアカウント作成・ログインできる（パスワードリセットなし、IdPなし）。
* 認証済みユーザーが検索キーワードを送信すると、**最大20件**の画像が表示される。
* 既定で `order=latest`、`safesearch=false` の条件で結果が返る。
* 画像クリックで**モーダル**詳細（作者・解像度・タグ・Pixabayリンク）が表示される。
* キャッシュヒット時は応答<500ms（目標値）。
