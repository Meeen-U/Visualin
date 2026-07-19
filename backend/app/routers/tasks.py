from datetime import datetime, timedelta, date
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.task import Task, TaskHistory
from app.security import get_current_user
from app.schemas.task import (
    TaskCreate,
    TaskUpdate,
    TaskResponse,
    TaskListResponse,
    TaskCreateResponse,
    TaskUpdateResponse,
    TaskDeleteResponse,
    TaskCompleteResponse,
)

router = APIRouter(prefix="/api/tasks", tags=["家事タスク管理"])


def _to_task_response(task: Task) -> TaskResponse:
    """DBのTaksモデルをレスポンス用のスキーマに変換する"""
    return TaskResponse(
        task_id=task.id,
        title=task.title,
        description=task.description,
        frequency_days=task.frequency_days,
        is_completed=task.is_completed,
        next_due_date=task.next_due_date,
        category=task.category,
    )


@router.get("", response_model=TaskListResponse)
def get_tasks(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """ログイン中ユーザーのタスク一覧を取得する"""
    tasks = db.query(Task).filter(Task.user_id == current_user.id).all()
    return TaskListResponse(tasks=[_to_task_response(t) for t in tasks])


@router.post("", response_model= TaskCreateResponse)
def create_task(
    task_in: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """新しい家事タスクを登録する"""
    new_task = Task(
        user_id=current_user.id,
        title=task_in.title,
        description=task_in.description,
        frequency_days=task_in.frequency_days,
        next_due_date=task_in.next_due_date,
        category=task_in.category,
        is_completed=False,
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    return TaskCreateResponse(
        message="タスクを登録しました",
        task=_to_task_response(new_task),
    )


def _get_owned_task(task_id: int, current_user: User, db: Session) -> Task:
    """指定IDのタスクを取得し、自分のタスクでなければエラーにする共通処理"""
    task = db.query(Task).filter(Task.id == task_id).first()
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="タスクが見つかりません")
    if task.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="このタスクへの操作は許可されていません")
    return task


@router.put("/{task_id}", response_model=TaskUpdateResponse)
def update_task(
    task_id: int,
    task_in: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """タスク内容を更新する"""
    task = _get_owned_task(task_id, current_user, db)

    update_data = task_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(task, key, value)

    db.commit()
    db.refresh(task)

    return TaskUpdateResponse(
        message="タスクを更新しました",
        task=_to_task_response(task),
    )


@router.delete("/{task_id}", response_model=TaskDeleteResponse)
def delete_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """タスクを削除する"""
    task = _get_owned_task(task_id, current_user, db)
    db.delete(task)
    db.commit()
    return TaskDeleteResponse(message="タスクを削除しました")


@router.post("/{task_id}/complete", response_model=TaskCompleteResponse)
def complete_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    タスクを「完了」にする
    実行履歴を保存し、frequency_daysに基づいて次回予定日を再計算する
    """
    task = _get_owned_task(task_id, current_user, db)

    now = datetime.now()

    history = TaskHistory(task_id=task.id, status="completed", executed_at=now)
    db.add(history)

    task.is_completed = True
    task.next_due_date = (now + timedelta(days=task.frequency_days)).date()

    db.commit()
    db.refresh(task)

    return TaskCompleteResponse(
        message="タスクを完了として記録しました",
        task=_to_task_response(task),
    )