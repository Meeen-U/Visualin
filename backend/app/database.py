import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

load_dotenv()

# データベース接続URL（未設定時はローカル開発用のSQLiteを使用）
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./visualin.db")

# SQLite使用時のみ check_same_thread=False を付与する
connect_args = (
    {"check_same_thread": False}
    if SQLALCHEMY_DATABASE_URL.startswith("sqlite")
    else {}
)

# データベースエンジンの作成
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args=connect_args)

# DBセッションを作るためのセッションローカル
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# モデルのベースクラス
Base = declarative_base()

# 各APIエンドポイントでDBセッションを使うための依存関係
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """テーブルとモデル定義済みのインデックスを作成する（既存テーブルの不足インデックスも補完）"""
    Base.metadata.create_all(bind=engine)
    for table in Base.metadata.sorted_tables:
        for index in table.indexes:
            index.create(bind=engine, checkfirst=True)
        
    