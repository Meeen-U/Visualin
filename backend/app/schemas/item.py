from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, field_validator

from app.schemas.validators import (
    OptionalCategoryStr,
    bounded_int,
    non_empty_single_line_str,
    reject_explicit_null,
)

ITEM_NAME_MAX_LENGTH = 100
ITEM_STOCK_MIN = 0
ITEM_STOCK_MAX = 9999
ITEM_QUANTITY_MIN = 1
ITEM_QUANTITY_MAX = ITEM_STOCK_MAX
ITEM_PURCHASE_CYCLE_MIN = 1
ITEM_PURCHASE_CYCLE_MAX = 3650

ItemNameStr = non_empty_single_line_str(ITEM_NAME_MAX_LENGTH)
ItemStockInt = bounded_int(ge=ITEM_STOCK_MIN, le=ITEM_STOCK_MAX)
ItemPurchaseCycleInt = bounded_int(ge=ITEM_PURCHASE_CYCLE_MIN, le=ITEM_PURCHASE_CYCLE_MAX)


class ItemCreate(BaseModel):
    """消耗品新規登録時のリクエスト"""
    name: ItemNameStr
    current_stock: ItemStockInt
    alert_threshold: ItemStockInt
    purchase_cycle: Optional[ItemPurchaseCycleInt] = None
    category: OptionalCategoryStr = None


class ItemUpdate(BaseModel):
    """消耗品更新時のリクエスト"""
    name: Optional[ItemNameStr] = None
    current_stock: Optional[ItemStockInt] = None
    alert_threshold: Optional[ItemStockInt] = None
    purchase_cycle: Optional[ItemPurchaseCycleInt] = None
    category: OptionalCategoryStr = None

    @field_validator("name", "current_stock", "alert_threshold", mode="before")
    @classmethod
    def _prevent_explicit_null(cls, v: object) -> object:
        return reject_explicit_null(v)


class ItemResponse(BaseModel):
    """消耗品情報のレスポンス"""
    model_config = ConfigDict(from_attributes=True)

    item_id: int
    name: str
    current_stock: int
    alert_threshold: int
    purchase_cycle: Optional[int] = None
    category: Optional[str] = None
    is_alert: bool


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
    model_config = ConfigDict(from_attributes=True)

    id: int
    action_type: str
    quantity_changed: int
    executed_at: datetime


class ItemStockUpdateResponse(BaseModel):
    """残量を減らす操作のレスポンス"""
    message: str
    item: ItemResponse


class ItemRestockResponse(BaseModel):
    """購入完了操作のレスポンス"""
    message: str
    item: ItemResponse
