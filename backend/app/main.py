import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from app.database import init_db
from app import models
from app.error_handlers import (
    format_validation_error as _format_validation_error,
    validation_exception_handler,
)
from app.routers import auth, tasks, items, ai

load_dotenv()

# テーブルとインデックスがまだ存在しなければ作成する
init_db()

app = FastAPI(title="Visualin API")
app.add_exception_handler(RequestValidationError, validation_exception_handler)


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
