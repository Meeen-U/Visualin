from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class ItemCreate(BaseModel):
    """消耗品新規登録時のリクエスト"""
    name: str
    current_stock: int
    alert_threshold: int
    purchase_cycle: Optional[int] = None
    category: Optional[str] = None


class ItemUpdate(BaseModel):
    """消耗品更新時のリクエスト"""
    name: Optional[str] = None
    current_stock: Optional[int] = None
    alert_threshold: Optional[int] = None
    purchase_cycle: Optional[int] = None
    category: Optional[str] = None


class ItemResponse(BaseModel):
    """消耗品情報のレスポンス"""
    item_id: int
    name: str
    current_stock: int
    alert_threshold: int
    purchase_cycle: Optional[int] = None
    category: Optional[str] = None
    is_alert: bool

    class Config:
        from_attributes = True

    
class ItemListResponse(BaseModel):
    items: list[ItemResponse]
    total: int
    page: int
    page_size: int
    categories: list[str] = []
    alert_count: int = 0


class ItemCreateResponse(BaseModel):
    message: str
    item: ItemResponse


class ItemUpdateResponse(BaseModel):
    message: str
    item: ItemResponse


class ItemDeleteResponse(BaseModel):
    message: str


class ItemHistoryResponse(BaseModel):
    """消耗品の操作履歴のレスポンス"""
    id: int
    action_type: str
    quantity_changed: int
    executed_at: datetime

    class Config:
        from_attributes = True


class ItemStockUpdateResponse(BaseModel):
    """残量を減らす操作のレスポンス"""
    message: str
    item: ItemResponse


class ItemRestockResponse(BaseModel):
    """購入完了操作のレスポンス"""
    message: str
    item: ItemResponse