from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Index
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Item(Base):
    __tablename__ = "items"
    __table_args__ = (
        Index("ix_items_user_id_category", "user_id", "category"),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String, nullable=False)
    current_stock = Column(Integer, default=0)
    alert_threshold = Column(Integer, default=0)
    purchase_cycle = Column(Integer, nullable=True)  # 日数
    category = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    owner = relationship("User", back_populates="items")
    histories = relationship("ItemHistory", back_populates="item", cascade="all, delete-orphan")

    @hybrid_property
    def is_alert(self) -> bool:
        """残量がアラート目安以下かどうか（Python評価・SQL式の両方で利用可能）"""
        return self.current_stock <= self.alert_threshold

    @is_alert.expression
    def is_alert(cls):
        return cls.current_stock <= cls.alert_threshold


class ItemHistory(Base):
    __tablename__ = "item_histories"
    __table_args__ = (
        Index("ix_item_histories_item_id_executed_at", "item_id", "executed_at"),
    )

    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("items.id"), nullable=False)
    action_type = Column(String, nullable=False)  # 例: "consume"（使用） / "restock"（購入補充）
    quantity_changed = Column(Integer, nullable=False)
    executed_at = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    item = relationship("Item", back_populates="histories")