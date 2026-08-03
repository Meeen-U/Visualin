from pydantic import BaseModel, EmailStr


class UserRegister(BaseModel):
    """新規登録時にクライアントから受け取るデータ"""
    name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    """ログイン時にクライアントから受け取るデータ"""
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """クライアントに返すユーザ情報（パスワードは含めない）"""
    user_id: int
    name: str
    email: EmailStr

    class Config:
        from_sttributes = True


class RegisterResponse(BaseModel):
    """新規登録成功時のレスポンス全体"""
    message: str
    user: UserResponse


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
    new_password: str

class PasswordResetResponse(BaseModel):
    """パスワードリセット成功時のレスポンス"""
    message: str