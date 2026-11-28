import os
from dotenv import load_dotenv
from fastapi import FastAPI, Request, status
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


def _format_validation_error(errors: list[dict]) -> str:
    """Pydanticのバリデーションエラーをユーザー向けの日本語メッセージに変換する"""
    for err in errors:
        loc = err.get("loc", ())
        if "email" in loc:
            raw_input = err.get("input")
            value = raw_input.strip() if isinstance(raw_input, str) else ""
            if "@" not in value:
                return "メールアドレスの形式が正しくありません。「@」を含めて入力してください（例: example@email.com）"
            _, domain = value.split("@", 1)
            if "." not in domain or domain.startswith(".") or domain.endswith("."):
                return "メールアドレスの形式が正しくありません。「@」の後に「.com」などのドメインを含めて入力してください（例: example@email.com）"
            return "メールアドレスの形式が正しくありません。正しいメールアドレスを入力してください（例: example@email.com）"
    return "入力内容に誤りがあります。各項目を確認してください"


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """422バリデーションエラー時に分かりやすい日本語メッセージを返す"""
    errors = exc.errors()
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
        content={
            "detail": _format_validation_error(errors),
            "errors": errors,
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