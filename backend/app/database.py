from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# SQLiteのデータベースファイルへのパス
SQLALCHEMY_DATABASE_URL = "sqlite:///./visualin.db"

# データベースエンジンの作成
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

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
        
    