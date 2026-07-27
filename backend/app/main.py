from fastapi import FastAPI
from app.database import engine, Base
from app import models
from app.routers import auth, tasks, items, ai

# テーブルがまだ存在しなければ作成する
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Visualin API")

app.include_router(auth.router)
app.include_router(tasks.router)
app.include_router(items.router)
app.include_router(ai.router)


@app.get("/")
def read_root():
    return {"message": "Visualin API is running"}