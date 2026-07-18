from fastapi import FastAPI
from app.database import engine, Base
from app import models
from app.routers import auth, tasks

# テーブルがまだ存在しなければ作成する
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Visualin API")

app.include_router(auth.router)
app.include_router(tasks.router)


@app.get("/")
def read_root():
    return {"message": "Visualin API is running"}