from sqlalchemy import Column, Integer, String, Boolean, Date, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Task(Base):
    __tablename__ = "tasks"
    __table_args__ = (
        Index("ix_tasks_user_id_next_due_date", "user_id", "next_due_date"),
        Index("ix_tasks_user_id_category", "user_id", "category"),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    frequency_days = Column(Integer, nullable=False)  # 実行間隔（日数）
    is_completed = Column(Boolean, default=False)      # 直近実行済みかの表示フラグ
    next_due_date = Column(Date, nullable=True)         # 次回実行予定日
    category = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    owner = relationship("User", back_populates="tasks")
    histories = relationship("TaskHistory", back_populates="task", cascade="all, delete-orphan")


class TaskHistory(Base):
    __tablename__ = "task_histories"
    __table_args__ = (
        Index("ix_task_histories_task_id_executed_at", "task_id", "executed_at"),
    )

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=False)
    status = Column(String, nullable=False)  # 例: "completed"
    executed_at = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    task = relationship("Task", back_populates="histories")