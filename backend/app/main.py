import os
from typing import Optional
from dotenv import load_dotenv
from fastapi import FastAPI, Request, status
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.database import init_db
from app import models
from app.routers import auth, tasks, items, ai

load_dotenv()

# テーブルとインデックスがまだ存在しなければ作成する
init_db()

app = FastAPI(title="Visualin API")


# フィールド名と日本語表示ラベル・単位の対応定義
_FIELD_LABELS: dict[str, tuple[str, str]] = {
    "title": ("家事の名前", ""),
    "description": ("説明", ""),
    "frequency_days": ("繰り返し間隔", "日"),
    "next_due_date": ("次回予定日", ""),
    "is_completed": ("完了状態", ""),
    "category": ("カテゴリ", ""),
    "current_stock": ("現在の残量", ""),
    "alert_threshold": ("アラート基準値", ""),
    "purchase_cycle": ("購入サイクル", "日"),
    "quantity": ("消費する数量", ""),
    "restock_quantity": ("補充する数量", ""),
    "page": ("ページ番号", ""),
    "page_size": ("1ページあたりの件数", ""),
    "due_within_days": ("期限までの日数", "日"),
    "due_before": ("期限日", ""),
    "overdue_only": ("期限切れ絞り込み", ""),
    "is_alert": ("アラート絞り込み", ""),
    "password": ("パスワード", ""),
    "new_password": ("新しいパスワード", ""),
    "task_name": ("家事の名前", ""),
    "season": ("季節", ""),
    "living_environment": ("住環境", ""),
    "task_id": ("タスクID", ""),
    "item_id": ("消耗品ID", ""),
}


def _resolve_field_label(field: str, path: str) -> tuple[str, str]:
    """エンドポイントのパスも考慮してフィールドの日本語ラベルと単位を返す"""
    if field == "name":
        if path.startswith("/api/auth"):
            return ("ユーザー名", "")
        return ("消耗品の名前", "")
    return _FIELD_LABELS.get(field, (f"「{field}」", ""))


def _format_email_error(err: dict) -> str:
    """メールアドレス項目のバリデーションエラーを詳細な日本語メッセージに変換する"""
    err_type = err.get("type", "")
    raw_input = err.get("input")

    if err_type in ("missing", "not_null") or raw_input is None:
        return "メールアドレスを入力してください"
    if not isinstance(raw_input, str):
        return "メールアドレスは文字列で入力してください"

    value = raw_input.strip()
    if not value:
        return "メールアドレスを入力してください"
    if "@" not in value:
        return "メールアドレスの形式が正しくありません。「@」を含めて入力してください（例: example@email.com）"
    _, domain = value.split("@", 1)
    if "." not in domain or domain.startswith(".") or domain.endswith("."):
        return "メールアドレスの形式が正しくありません。「@」の後に「.com」などのドメインを含めて入力してください（例: example@email.com）"
    return "メールアドレスの形式が正しくありません。正しいメールアドレスを入力してください（例: example@email.com）"


def _format_single_error(err: dict, path: str) -> Optional[str]:
    """単一のPydanticエラー辞書を日本語メッセージに変換する（補助エラーは None を返す）"""
    err_type = err.get("type", "")
    if err_type == "none_required":
        # Optional[T] の Union 検証で T 側と同時発生する None 分岐エラーはスキップする
        return None

    if err_type == "json_invalid":
        return "リクエストのJSON形式が正しくありません"

    loc = err.get("loc", ())
    source = str(loc[0]) if len(loc) >= 1 else ""
    field = str(loc[1]) if len(loc) >= 2 and isinstance(loc[1], str) else None

    if source == "body" and field is None:
        return "リクエストボディを正しいJSON形式で送信してください"

    if field is None:
        return "入力内容に誤りがあります。各項目を確認してください"

    if field == "email":
        return _format_email_error(err)

    label, unit = _resolve_field_label(field, path)
    action = "指定してください" if source in ("query", "path") else "入力してください"
    raw_input = err.get("input")
    ctx = err.get("ctx") or {}

    if err_type in ("missing", "not_null") or (
        raw_input is None
        and err_type in ("string_type", "int_type", "bool_type", "float_type", "date_type")
    ):
        return f"{label}を{action}"

    if err_type == "string_too_short":
        min_len = ctx.get("min_length", 1)
        if min_len <= 1:
            if isinstance(raw_input, str) and len(raw_input) > 0 and not raw_input.strip():
                return f"{label}は空白のみでは登録できません"
            return f"{label}を{action}（空白のみは登録できません）"
        return f"{label}は{min_len}文字以上で{action}"

    if err_type == "string_too_long":
        max_len = ctx.get("max_length")
        if max_len is not None:
            return f"{label}は{max_len}文字以内で{action}"
        return f"{label}の文字数が上限を超えています"

    if err_type == "string_type":
        return f"{label}は文字列で{action}"

    if err_type == "greater_than_equal":
        ge = ctx.get("ge")
        if ge is not None:
            return f"{label}は{ge}{unit}以上で{action}"
        return f"{label}の値が小さすぎます"

    if err_type == "greater_than":
        gt = ctx.get("gt")
        if gt is not None:
            return f"{label}は{gt}{unit}より大きい値で{action}"
        return f"{label}の値が小さすぎます"

    if err_type == "less_than_equal":
        le = ctx.get("le")
        if le is not None:
            return f"{label}は{le}{unit}以下で{action}"
        return f"{label}の値が大きすぎます"

    if err_type == "less_than":
        lt = ctx.get("lt")
        if lt is not None:
            return f"{label}は{lt}{unit}未満で{action}"
        return f"{label}の値が大きすぎます"

    if err_type in ("int_parsing", "int_type", "int_from_float"):
        if raw_input == "":
            return f"{label}を{action}"
        return f"{label}は整数で{action}"

    if err_type.startswith("date"):
        return f"{label}は正しい日付形式（YYYY-MM-DD）で{action}"

    if err_type.startswith("bool"):
        return f"{label}は真偽値（true / false）で{action}"

    return f"{label}の入力内容が正しくありません"


def _format_validation_error(errors: list[dict], path: str = "") -> str:
    """Pydanticのバリデーションエラー一覧をユーザー向けの日本語メッセージに変換する"""
    messages: list[str] = []
    seen_fields: set[tuple[str, Optional[str]]] = set()

    for err in errors:
        loc = err.get("loc", ())
        source = str(loc[0]) if len(loc) >= 1 else ""
        field = str(loc[1]) if len(loc) >= 2 and isinstance(loc[1], str) else None
        field_key = (source, field)

        msg = _format_single_error(err, path)
        if not msg:
            continue

        if field is not None and field_key in seen_fields:
            continue
        if field is not None:
            seen_fields.add(field_key)
        if msg not in messages:
            messages.append(msg)

    if messages:
        return " / ".join(messages)
    return "入力内容に誤りがあります。各項目を確認してください"


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """422バリデーションエラー時に分かりやすい日本語メッセージを返す"""
    errors = exc.errors()
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
        content={
            "detail": _format_validation_error(errors, path=request.url.path),
            "errors": jsonable_encoder(errors),
        },
    )

def _get_cors_origins() -> list[str]:
    """環境変数 CORS_ORIGINS（カンマ区切り）から許可オリジン一覧を取得する"""
    raw = os.getenv("CORS_ORIGINS", "http://localhost:5173")
    origins = [origin.strip() for origin in raw.split(",") if origin.strip()]
    return origins or ["http://localhost:5173"]


# フロントエンドからのアクセスを許可する
app.add_middleware(
    CORSMiddleware,
    allow_origins=_get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(tasks.router)
app.include_router(items.router)
app.include_router(ai.router)


@app.get("/")
def read_root():
    return {"message": "Visualin API is running"}