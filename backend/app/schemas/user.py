from typing import Optional
from pydantic import BaseModel, EmailStr, Field, model_validator
from pydantic_core import PydanticCustomError

from app.schemas.validators import PasswordStr, UsernameStr


class UserRegister(BaseModel):
    """新規登録時にクライアントから受け取るデータ"""
    name: UsernameStr
    email: EmailStr
    password: PasswordStr
    password_confirm: Optional[str] = None

    @model_validator(mode="after")
    def validate_password_match(self) -> "UserRegister":
        if self.password_confirm is not None and self.password != self.password_confirm:
            raise PydanticCustomError(
                "password_mismatch",
                "パスワードが一致しません",
            )
        return self


class UserLogin(BaseModel):
    """ログイン時にクライアントから受け取るデータ"""
    email: EmailStr
    password: str = Field(min_length=1)


class UserResponse(BaseModel):
    """クライアントに返すユーザ情報（パスワードは含めない）"""
    user_id: int
    name: str
    email: EmailStr

    class Config:
        from_attributes = True


class RegisterResponse(BaseModel):
    """新規登録成功時のレスポンス全体"""
    message: str
    user: UserResponse
    access_token: str
    token_type: str = "bearer"


class LoginResponse(BaseModel):
    """ログイン成功時のレスポンス全体"""
    message: str
    access_token: str
    token_type: str = "bearer"


class LogoutResponse(BaseModel):
    """ログアウト成功時のレスポンス"""
    message: str


class PasswordResetRequest(BaseModel):
    """パスワードリセットリクエスト時にクライアントから受け取るデータ"""
    email: EmailStr
    new_password: PasswordStr
    new_password_confirm: Optional[str] = None

    @model_validator(mode="after")
    def validate_new_password_match(self) -> "PasswordResetRequest":
        if (
            self.new_password_confirm is not None
            and self.new_password != self.new_password_confirm
        ):
            raise PydanticCustomError(
                "password_mismatch",
                "新しいパスワードが一致しません",
            )
        return self


class PasswordResetResponse(BaseModel):
    """パスワードリセット成功時のレスポンス"""
    message: str