from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, field_validator

from app.schemas.validators import (
    OptionalCategoryStr,
    OptionalIsoDate,
    StrictBoolField,
    bounded_int,
    non_empty_single_line_str,
    optional_multiline_str,
    reject_explicit_null,
)

TASK_TITLE_MAX_LENGTH = 100
TASK_DESCRIPTION_MAX_LENGTH = 1000
TASK_FREQUENCY_MIN = 1
TASK_FREQUENCY_MAX = 3650

TaskTitleStr = non_empty_single_line_str(TASK_TITLE_MAX_LENGTH)
OptionalTaskDescriptionStr = optional_multiline_str(TASK_DESCRIPTION_MAX_LENGTH)
TaskFrequencyDays = bounded_int(ge=TASK_FREQUENCY_MIN, le=TASK_FREQUENCY_MAX)


class TaskCreate(BaseModel):
    """タスク新規登録時のリクエスト"""
    title: TaskTitleStr
    description: OptionalTaskDescriptionStr = None
    frequency_days: TaskFrequencyDays
    next_due_date: OptionalIsoDate = None
    category: OptionalCategoryStr = None


class TaskUpdate(BaseModel):
    """タスク更新時のリクエスト（すべて任意項目）"""
    title: Optional[TaskTitleStr] = None
    description: OptionalTaskDescriptionStr = None
    frequency_days: Optional[TaskFrequencyDays] = None
    next_due_date: OptionalIsoDate = None
    category: OptionalCategoryStr = None
    is_completed: Optional[StrictBoolField] = None

    @field_validator("title", "frequency_days", "is_completed", mode="before")
    @classmethod
    def _prevent_explicit_null(cls, v: object) -> object:
        return reject_explicit_null(v)


class TaskResponse(BaseModel):
    """タスク情報のレスポンス"""
    model_config = ConfigDict(from_attributes=True)

    task_id: int
    title: str
    description: Optional[str] = None
    frequency_days: int
    is_completed: bool
    next_due_date: Optional[date] = None
    category: Optional[str] = None


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
    model_config = ConfigDict(from_attributes=True)

    id: int
    status: str
    executed_at: datetime


class TaskCompleteResponse(BaseModel):
    message: str
    task: TaskResponse
