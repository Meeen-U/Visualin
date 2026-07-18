from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.database import get_db
from app.models.user import User
from app.schemas.user import (
    UserRegister,
    UserLogin,
    UserResponse,
    RegisterResponse,
    LoginResponse,
    LogoutResponse
)
from app.security import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/api/auth", tags=["認証"])


@router.post("/register", response_model=RegisterResponse)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    # メールアドレスの重複チェック
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="このメールアドレスは既に登録されています",
        )
    
    new_user = User(
        username=user_in.name,
        email=user_in.email,
        password_hash=hash_password(user_in.password),
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return RegisterResponse(
        message="アカウントの登録が完了しました",
        user=UserResponse(
            user_id=new_user.id,
            name=new_user.username,
            email=new_user.email,
        ),
    )


@router.post("/login", response_model=LoginResponse)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()

    if not user or not verify_password(credentials.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="メールアドレスまたはパスワードが正しくありません",
        )
    
    access_token = create_access_token(data={"sub": str(user.id)})

    return LoginResponse(
        message="ログインに成功しました",
        access_token=access_token,
    )


@router.post("/logout", response_model=LogoutResponse)
def logout():
    """
    JWT方式ではサーバー側にセッション情報を持たないので、
    クライアント側でトークンを破棄することで実質的なログアウトとする
    """
    return LogoutResponse(message="ログアウトしました")