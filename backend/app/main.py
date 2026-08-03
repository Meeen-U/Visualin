from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app import models
from app.routers import auth, tasks, items, ai

# テーブルがまだ存在しなければ作成する
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Visualin API")

# フロントエンドからのアクセスを許可する
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
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