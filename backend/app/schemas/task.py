from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel

class TaskCreate(BaseModel):
    """タスク新規登録時のリクエスト"""
    title: str
    description: Optional[str] = None
    frequency_days: int
    next_due_date: Optional[date] = None
    category: Optional[str] = None


class TaskUpdate(BaseModel):
    """タスク更新時のリクエスト（すべて任意項目）"""
    title: Optional[str] = None
    description: Optional[str] = None
    frequency_days: Optional[int] = None
    next_due_date: Optional[date] = None
    category: Optional[str] = None
    is_completed: Optional[bool] = None


class TaskResponse(BaseModel):
    """タスク情報のレスポンス"""
    task_id: int
    title: str
    description: Optional[str] = None
    frequency_days: int
    is_completed: bool
    next_due_date: Optional[date] = None
    category: Optional[str] = None

    class Config:
        from_attributes = True


class TaskListResponse(BaseModel):
    """タスク一覧レスポンス"""
    tasks: list[TaskResponse]
    total: int
    page: int
    page_size: int
    categories: list[str] = []


class TaskCreateResponse(BaseModel):
    message: str
    task: TaskResponse


class TaskUpdateResponse(BaseModel):
    message: str
    task: TaskResponse


class TaskDeleteResponse(BaseModel):
    message: str


class TaskHistoryResponse(BaseModel):
    """タスク完了履歴のレスポンス"""
    id: int
    status: str
    executed_at: datetime

    class Config:
        from_attributes = True


class TaskCompleteResponse(BaseModel):
    message: str
    task: TaskResponse