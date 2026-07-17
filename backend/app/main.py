from fastapi import FastAPI
from app.database import engine, Base
from app import models

# テーブルがまだ存在しなければ作成する
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Visualin API")


@app.get("/")
def read_root():
    return {"message": "Visualin API is running"}