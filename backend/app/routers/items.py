from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.item import Item, ItemHistory
from app.pagination import paginate, paging_query
from app.security import get_current_user
from app.schemas.item import (
    ITEM_QUANTITY_MAX,
    ITEM_QUANTITY_MIN,
    ITEM_STOCK_MAX,
    ItemCreate,
    ItemUpdate,
    ItemResponse,
    ItemListResponse,
    ItemCreateResponse,
    ItemUpdateResponse,
    ItemDeleteResponse,
    ItemStockUpdateResponse,
    ItemRestockResponse,
)

router = APIRouter(prefix="/api/items", tags=["日用品・消耗品管理"])


def _to_item_response(item: Item) -> ItemResponse:
    """DBのItemモデルをレスポンス用のスキーマに変換する"""
    return ItemResponse(
        item_id=item.id,
        name=item.name,
        current_stock=item.current_stock,
        alert_threshold=item.alert_threshold,
        purchase_cycle=item.purchase_cycle,
        category=item.category,
        is_alert=item.is_alert,
    )


@router.get("", response_model=ItemListResponse)
def get_items(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    paging: tuple[int, int] = Depends(paging_query),
    category: Optional[str] = Query(None, description="カテゴリで絞り込む（未指定なら全件）"),
    is_alert: Optional[bool] = Query(
        None,
        description="在庫アラート状態で絞り込む（true: アラート品のみ, false: 通常品のみ, 未指定: 全件）",
    ),
):
    """ログイン中ユーザーの消耗品一覧・在庫を取得する（DB絞り込み・ページング対応）"""
    page, page_size = paging
    owned = db.query(Item).filter(Item.user_id == current_user.id)
    query = owned
    if category:
        query = query.filter(Item.category == category)
    if is_alert is True:
        query = query.filter(Item.is_alert)
    elif is_alert is False:
        query = query.filter(~Item.is_alert)

    query = query.order_by(
        Item.is_alert.desc(),
        Item.id.asc(),
    )
    items, total = paginate(query, page, page_size)

    categories = [
        name
        for (name,) in (
            owned.filter(Item.category.isnot(None), Item.category != "")
            .with_entities(Item.category)
            .distinct()
            .order_by(Item.category.asc())
            .all()
        )
    ]
    alert_count = owned.filter(Item.is_alert).count()

    return ItemListResponse(
        items=[_to_item_response(i) for i in items],
        total=total,
        page=page,
        page_size=page_size,
        categories=categories,
        alert_count=alert_count,
    )


@router.post("", response_model=ItemCreateResponse)
def create_item(
    item_in: ItemCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """新しい消耗品を登録する"""
    new_item = Item(
        user_id=current_user.id,
        name=item_in.name,
        current_stock=item_in.current_stock,
        alert_threshold=item_in.alert_threshold,
        purchase_cycle=item_in.purchase_cycle,
        category=item_in.category,
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)

    return ItemCreateResponse(
        message="消耗品を登録しました",
        item=_to_item_response(new_item),
    )


def _get_owned_item(item_id: int, current_user: User, db: Session) -> Item:
    """指定IDかつログイン中ユーザー所有の消耗品を取得する共通処理"""
    item = (
        db.query(Item)
        .filter(Item.id == item_id, Item.user_id == current_user.id)
        .first()
    )
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="消耗品が見つかりません")
    return item

@router.put("/{item_id}", response_model=ItemUpdateResponse)
def update_item(
    item_id: int,
    item_in: ItemUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """消耗品の残量・情報を更新する（汎用更新）"""
    item = _get_owned_item(item_id, current_user, db)

    update_data = item_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(item, key, value)
    
    db.commit()
    db.refresh(item)

    return ItemUpdateResponse(
        message="消耗品情報を更新しました",
        item=_to_item_response(item),
    )


@router.delete("/{item_id}", response_model=ItemDeleteResponse)
def delete_item(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """消耗品を削除する"""
    item = _get_owned_item(item_id, current_user, db)
    db.delete(item)
    db.commit()
    return ItemDeleteResponse(message="消耗品を削除しました")


@router.post("/{item_id}/consume", response_model=ItemStockUpdateResponse)
def consume_item(
    item_id: int,
    quantity: int = Query(
        1,
        ge=ITEM_QUANTITY_MIN,
        le=ITEM_QUANTITY_MAX,
        description="消費する数量（1以上）",
    ),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    消耗品を使用して残量を減らす
    """
    item = _get_owned_item(item_id, current_user, db)

    if item.current_stock - quantity < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="残量が不足しているため、その数量は減らせません",
        )
    
    item.current_stock -= quantity

    history = ItemHistory(
        item_id=item.id,
        action_type="consume",
        quantity_changed=-quantity,
        executed_at=datetime.now(),
    )
    db.add(history)
    db.commit()
    db.refresh(item)

    return ItemStockUpdateResponse(
        message="残量を更新しました",
        item=_to_item_response(item),
    )


@router.post("/{item_id}/restock", response_model=ItemRestockResponse)
def restock_item(
    item_id: int,
    restock_quantity: int = Query(
        ...,
        ge=ITEM_QUANTITY_MIN,
        le=ITEM_QUANTITY_MAX,
        description="補充する数量（1以上）",
    ),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    消耗品の購入完了を記録し、残量を補充する
    """
    item = _get_owned_item(item_id, current_user, db)

    if item.current_stock + restock_quantity > ITEM_STOCK_MAX:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"在庫数の上限（{ITEM_STOCK_MAX}）を超えるため補充できません",
        )

    item.current_stock += restock_quantity

    history = ItemHistory(
        item_id=item.id,
        action_type="restock",
        quantity_changed=restock_quantity,
        executed_at=datetime.now(),
    )
    db.add(history)
    db.commit()
    db.refresh(item)

    return ItemRestockResponse(
        message="購入を記録し、残量を更新しました",
        item=_to_item_response(item),
    )