from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    current_stock = Column(Integer, default=0)
    alert_threshold = Column(Integer, default=0)
    purchase_cycle = Column(Integer, nullable=True)  # 日数
    category = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    owner = relationship("User", back_populates="items")
    histories = relationship("ItemHistory", back_populates="item", cascade="all, delete-orphan")

    @property
    def is_alert(self) -> bool:
        """残量がアラート目安を下回っているかどうか（DBには保存しない計算値）"""
        return self.current_stock <= self.alert_threshold


class ItemHistory(Base):
    __tablename__ = "item_histories"

    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("items.id"), nullable=False)
    action_type = Column(String, nullable=False)  # 例: "consume"（使用） / "restock"（購入補充）
    quantity_changed = Column(Integer, nullable=False)
    executed_at = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    item = relationship("Item", back_populates="histories")