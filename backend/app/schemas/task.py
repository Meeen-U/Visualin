from datetime import date, datetime
from typing import Annotated, Optional
from pydantic import (
    BaseModel,
    BeforeValidator,
    ConfigDict,
    Field,
    StringConstraints,
    field_validator,
)

from app.schemas.validators import (
    OptionalCategoryStr,
    empty_str_to_none,
    reject_bool,
    reject_explicit_null,
)

TASK_TITLE_MAX_LENGTH = 100
TASK_DESCRIPTION_MAX_LENGTH = 1000
TASK_FREQUENCY_MIN = 1
TASK_FREQUENCY_MAX = 3650

TaskTitleStr = Annotated[
    str,
    StringConstraints(
        strip_whitespace=True,
        min_length=1,
        max_length=TASK_TITLE_MAX_LENGTH,
    ),
]
OptionalTaskDescriptionStr = Annotated[
    Optional[
        Annotated[
            str,
            StringConstraints(
                strip_whitespace=True,
                max_length=TASK_DESCRIPTION_MAX_LENGTH,
            ),
        ]
    ],
    BeforeValidator(empty_str_to_none),
]
TaskFrequencyDays = Annotated[
    int,
    BeforeValidator(reject_bool),
    Field(ge=TASK_FREQUENCY_MIN, le=TASK_FREQUENCY_MAX),
]


class TaskCreate(BaseModel):
    """タスク新規登録時のリクエスト"""
    title: TaskTitleStr
    description: OptionalTaskDescriptionStr = None
    frequency_days: TaskFrequencyDays
    next_due_date: Optional[date] = None
    category: OptionalCategoryStr = None


class TaskUpdate(BaseModel):
    """タスク更新時のリクエスト（すべて任意項目）"""
    title: Optional[TaskTitleStr] = None
    description: OptionalTaskDescriptionStr = None
    frequency_days: Optional[TaskFrequencyDays] = None
    next_due_date: Optional[date] = None
    category: OptionalCategoryStr = None
    is_completed: Optional[bool] = None

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