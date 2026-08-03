# Visualin（びじゅありん）開発 引き継ぎメモ

このドキュメントは、Claudeとのチャットセッションを新しく開始する際に、これまでの経緯・決定事項・現在の状態を伝えるためのものです。このメモに加えて、以下の資料もあわせて新チャットに渡してください。

- `要件定義.pdf`
- `API設計.pdf`
- `ER図.pdf`
- `ユースケース記述.pdf`
- `状態遷移図-ページ-3_drawio.pdf`
- フロントエンドのプロトタイプHTML/CSS一式（`frontend_designs`フォルダの内容）
- （必要であれば）現在の`backend`フォルダのソースコード一式

---

## 1. プロジェクト概要

- **アプリ名**：Visualin（びじゅありん）
- **目的**：家事タスクの可視化と定期実行の促進、日用品・消耗品の在庫管理、Gemini AIによる家事の細分化・提案・購入予測支援
- **対象ユーザー**：個人利用（プライベート運用）
- **開発手法**：ウォーターフォールモデル（要件定義書に明記）だが、実装自体は「バイブコーディング」で進行中
- **開発者のスキルレベル**：Git/GitHub操作、Python環境構築などを一つずつ学びながら進めている段階。細かい手順の説明を必要とする

## 2. 技術スタック（確定）

- フロントエンド：HTML, CSS, JavaScript（将来的にフレームワーク導入の可能性はあるが未決定）
- バックエンド：Python / FastAPI
- データベース：SQLite（開発用、将来的にPostgreSQL検討）
- AI連携：Google Gemini API（`google-genai`ライブラリ、モデルは`gemini-2.5-flash`を使用、無料枠のみで運用し課金アカウントは紐付けない方針）
- IDE：VSCode
- バージョン管理：Git / GitHub（Webブラウザ上での手動操作を基本とする。ユーザーはGitHub CLIやGitHub Desktopは使わず、コマンドはVSCodeのターミナルで実行）

## 3. リポジトリ構成（確定・重要な設計判断）

- **モノリポ構成**を採用（フロントエンド・バックエンドを1つのリポジトリ`Visualin`内で管理）
  - 理由：個人開発規模であり、バイブコーディングでAIがフロント/バックエンド両方の整合性を見ながら開発できる利点を優先したため
- GitHubリポジトリ名：`Visualin`（Meeen-Uアカウント配下、Private）
- ブランチ運用：**機能ごとにブランチを切る**方式（`feature/xxx`ブランチを作成 → 動作確認 → `main`にPull Requestでマージ → ブランチ削除）
- 現在のフォルダ構成：

```
Visualin/
├── frontend_designs/   ← 設計段階のプロトタイプHTML/CSS（本実装ではない）
│   ├── style.css
│   ├── 1_login.html
│   ├── 2_password_reset.html
│   ├── 3_register.html
│   ├── 4_register_complete.html   （元ファイル名のタイプミスrefister→registerを修正済み）
│   ├── 5_home.html
│   ├── 6_task_register.html
│   ├── 7_task_detail.html
│   ├── 8_task_edit.html
│   ├── 9_item_register.html
│   ├── 10_ai_integration.html
│   ├── 11_item_detail.html
│   └── 12_item_edit.html
├── frontend/            ← 今後作る本実装用（現在まだ空）
├── backend/             ← FastAPIバックエンド（詳細は後述、実装済み）
├── docs/                ← 要件定義書・API設計書・ER図・ユースケース記述などのPDF
├── .gitignore
└── README.md
```

- **frontend_designsという名称の意図**：いただいたHTML/CSSは「設計段階の成果物（プロトタイプ）」であり、今後本実装として作り直す想定。本実装は`frontend`フォルダに別途作成する。

## 4. データベース設計（確定した設計判断）

ER図とAPI設計書の間に齟齬があったため、以下の通り確定した。

### Tasksテーブルの状態管理方式
- **`is_completed`（フラグ）と`next_due_date`（次回予定日）を両方持たせる併用方式**で確定
  - `is_completed`：直近の実行が完了しているかのシンプルな表示用フラグ
  - `next_due_date`：`TaskHistories`の最新実行日 + `frequency_days`から再計算される次回予定日
- 動作フロー（タスク完了時）：
  1. `TaskHistories`に実行履歴レコードを追加（`executed_at`）
  2. `Tasks.is_completed`を`true`に更新
  3. `Tasks.next_due_date`を`executed_at + frequency_days`で再計算

### 繰り返し頻度の項目名・データ型
- **項目名は`frequency_days`（API設計書の方式）で統一**。ER図側にあった`repeat_interval`という名称は廃止。
- データ型は**整数（日数）**。「毎日」=1、「週1回」=7、「月1回」=30のように日数換算で運用する。

### 実装済みテーブル構成（models）

- **User**（`users`）：id, username, email, password_hash, created_at, updated_at
- **Task**（`tasks`）：id, user_id, title, description, frequency_days, is_completed, next_due_date, category, created_at, updated_at
- **TaskHistory**（`task_histories`）：id, task_id, status, executed_at, created_at
- **Item**（`items`）：id, user_id, name, current_stock, alert_threshold, purchase_cycle, category, created_at, updated_at
  - `is_alert`は**DBに保存しない計算プロパティ**（`current_stock <= alert_threshold`で都度算出）として実装。残量更新時にアラート状態の更新漏れを防ぐ設計判断。
- **ItemHistory**（`item_histories`）：id, item_id, action_type（"consume" or "restock"）, quantity_changed, executed_at, created_at

## 5. バックエンド実装状況（すべて実装済み・動作確認済み）

### ディレクトリ構成

```
backend/
├── venv/                  ← 仮想環境（.gitignoreで除外）
├── app/
│   ├── __init__.py
│   ├── main.py             ← FastAPIエントリーポイント、ルーター登録
│   ├── database.py         ← DB接続設定（SQLAlchemy, SQLite）
│   ├── security.py         ← パスワードハッシュ化、JWT発行/検証、認証の門番機能
│   ├── gemini_client.py    ← Gemini API通信の共通処理
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── task.py         ← Task, TaskHistory
│   │   └── item.py         ← Item, ItemHistory
│   ├── schemas/
│   │   ├── user.py
│   │   ├── task.py
│   │   ├── item.py
│   │   └── ai.py
│   └── routers/
│       ├── auth.py         ← /api/auth/register, login, logout
│       ├── tasks.py        ← /api/tasks 系（CRUD + /complete）
│       ├── items.py        ← /api/items 系（CRUD + /consume + /restock）
│       └── ai.py           ← /api/ai 系（breakdown, propose, predict）
├── .env                     ← SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES, GEMINI_API_KEY（.gitignoreで除外）
├── requirements.txt         ← 現在空のまま（要対応、後述）
└── visualin.db              ← SQLite DBファイル（.gitignoreで除外）
```

### 認証方式の設計判断（重要）

- JWT（JSON Web Token）方式を採用。ステートレス（サーバー側にセッションを持たない）。
- `logout`エンドポイントは、JWT方式のため実質的にサーバー側の処理は形式的（クライアント側でトークンを破棄することでログアウトが完了する）。
- **Swagger UIでの認証方式**：当初`OAuth2PasswordBearer`を使っていたが、Swagger UI上でusername/password形式の入力欄しか出ず使いづらかったため、**`HTTPBearer`方式に変更**。これにより「Authorize」ボタンを押すと`Value`欄が1つだけ表示され、そこにアクセストークンの文字列をそのまま貼り付ける形になっている。

### 実装済みAPIエンドポイント一覧

**認証系**（`/api/auth`）
- `POST /register` - 新規登録
- `POST /login` - ログイン（access_token発行）
- `POST /logout` - ログアウト（形式的な処理）

**家事タスク管理系**（`/api/tasks`、すべて認証必須）
- `GET /` - タスク一覧取得
- `POST /` - タスク新規登録
- `PUT /{task_id}` - タスク更新
- `DELETE /{task_id}` - タスク削除
- `POST /{task_id}/complete` - タスク完了処理（履歴記録+next_due_date再計算）※API設計書に明記はないが、ユースケース記述2-5を実現するために追加した設計判断

**日用品・消耗品管理系**（`/api/items`、すべて認証必須）
- `GET /` - 消耗品一覧取得
- `POST /` - 消耗品新規登録
- `PUT /{item_id}` - 消耗品情報更新（汎用更新）
- `DELETE /{item_id}` - 消耗品削除
- `POST /{item_id}/consume?quantity=n` - 残量を減らす（0未満にはできないバリデーションあり）
- `POST /{item_id}/restock?restock_quantity=n` - 購入完了・残量補充

**AI連携系**（`/api/ai`、すべて認証必須、Gemini API通信あり）
- `POST /breakdown` - 家事の細分化（task_nameを渡す）
- `POST /propose` - 家事の提案（season, living_environmentを渡す）
- `POST /predict` - 購入タイミング予測（item_idを渡す。履歴が2件未満だと400エラー）

すべてのエンドポイントで**所有者チェック**（他人のタスク/消耗品を操作できないよう`user_id`の一致を確認）を実装済み。

### セキュリティ関連の設定
- パスワードは`passlib`（bcrypt）でハッシュ化してDB保存
- JWTの`SECRET_KEY`等は`.env`で管理（`.gitignore`で除外済み、Gitには含まれない）
- Gemini APIキーも`.env`で管理

## 6. 遭遇した主なエラーと解決策（今後同種の問題が起きた際の参考）

開発中、以下のようなトラブルが頻発した。同じパターンが再発する可能性があるため記録しておく。

1. **VSCodeのGit Clone失敗**：以前削除したはずの同名プロジェクトフォルダがローカルに残っており、クローンではなく空フォルダに手動でサブフォルダを作っていた状態になっていた。→ `git init` + `git remote add origin`で解決。
2. **ブランチ名の不一致**：ローカルが`master`、GitHub側は`main`。`git branch -M main`で統一。
3. **`.env`のBOM問題**：PowerShellの`Out-File`やVSCode保存で`.env`がBOM付きUTF-8として保存され、`python-dotenv`が正しく読み込めない事象が複数回発生。最終的に`python -c "open('.env','w',encoding='utf-8').write(...)"`のようにPythonで直接書き込むことで解決。
4. **VSCodeのPythonインタープリターのずれ**：仮想環境を作っても、VSCode自体が別の（時には全く別プロジェクトの）Pythonを見てしまう事象が複数回発生。`Ctrl+Shift+P` → `Python: Select Interpreter` → 明示的に`venv\Scripts\python.exe`のフルパスを指定することで解決。
5. **`bcrypt`と`passlib`のバージョン不整合**：最新の`bcrypt`ライブラリと`passlib`の相性問題で「password cannot be longer than 72 bytes」エラーが発生。`pip install "bcrypt==4.0.1"`でバージョン固定して解決。
6. **DBスキーマ変更が反映されない**：SQLAlchemyの`Base.metadata.create_all()`は既存テーブルの構造変更を行わないため、モデルにカラムを追加してもDBファイルには反映されない。開発初期はDBファイル（`visualin.db`）を削除して再作成することで対応。**今後、実データが入った後は`Alembic`などのマイグレーションツールの導入を検討する必要がある**（未対応）。
7. **多数のタイポ・コーディングミス**：手作業でのコード入力の際、以下のようなミスが頻発した。今後も同様のミスに注意。
   - メソッド名のタイポ（`updata`→`update`、`models_dump`→`model_dump`など）
   - JWTペイロードキーのタイポ（`"ecp"`→`"exp"`）
   - 構文エラー（カンマ抜け）
   - スキーマ定義でのフィールド名の入れ替わり・タイポ（`frequency_day`→`frequency_days`、`messge`→`message`など）
   - 関数の`return`忘れ（`_get_owned_item`が値を返さずNoneになっていた）
   - レスポンス変換時の引数の取り違え（`is_completed`に`next_due_date`の値を渡していた）
   - スキーマクラスの内容の重複・誤り（`ItemDeleteResponse`の内容が実際は`ItemHistoryResponse`の内容になっていた）
   - Gemini関連の設定キーのタイポ（`response_mine_type`→`response_mime_type`）
   - ルーター関数の引数の型指定ミス（リクエスト用スキーマとレスポンス用スキーマを取り違え、例：`BreakdownRequest`と書くべき箇所が`BreakdownResponse`になっていた）

## 7. 現在の状態（このメモ作成時点）

- バックエンドの4系統（認証・タスク・消耗品・AI連携）**すべて実装完了、Swagger UI（`/docs`）上での動作確認完了**
- `feature/backend-init`ブランチの内容を、GitHub上でPull Requestを作成し、**`main`ブランチにマージ済み**。GitHub側・ローカル側とも該当ブランチは削除済み
- ローカルは`main`ブランチに切り替え、`git pull origin main`で最新化済み（のはず、新チャットで再確認推奨）

## 8. 未対応・今後の課題

- `requirements.txt`が空のまま（`pip freeze > requirements.txt`のような形で、インストール済みライブラリ一覧を書き出す作業が未実施）
- フロントエンドの本実装（`frontend`フォルダ）に未着手。現在あるのは`frontend_designs`（プロトタイプ）のみ
- Alembic等によるDBマイグレーション管理の導入（実データが入る前に検討推奨）
- ホスティング（Render/Vercel/Heroku等）へのデプロイ作業は未着手
- Gemini APIの無料枠は課金アカウントを紐付けずに運用する方針（意図しない課金は発生しない設計だが、利用量が多いと429エラー等で一時的に使えなくなる可能性がある）

## 9. 開発者の進行スタイル・好みの傾向（新チャットでの対応方針）

- Git/GitHub操作、Python環境構築などについて、**一つ一つ丁寧に手順を確認しながら**進めることを好む
- エラーが出た際は、実際のエラーメッセージ・出力ログをそのまま貼ってもらい、それをもとに原因を特定するスタイルで進めてきた
- 込み入った作業のあとは適宜チャットを分けたい意向がある（このメモはその引き継ぎのために作成）
- コードは手作業でVSCodeに入力しているため、タイポ等のヒューマンエラーが起こりやすい。**AIが提示したコードと、実際に貼られたコードを注意深く突き合わせて確認する**ことが重要
- 確認が不要な場合はまとめて複数ステップ・複数ファイルを一気に提示してよい（ただし重要な設計判断は都度確認する）

---

## 新チャットの開始時に伝えるべきこと（要約）

新しいチャットでは、このメモに加えて要件定義書・API設計書・ER図・ユースケース記述・フロントエンドプロトタイプ一式・（可能であれば）現在のbackendソースコードを渡し、「このメモの内容を前提に、Visualinアプリの開発を続きから進めたい」と伝えてください。次のアクションとしては、フロントエンド本実装への着手、またはバックエンドの残課題（requirements.txt整備、Alembic導入検討など）のどちらから始めるかを確認するのが自然な流れです。
