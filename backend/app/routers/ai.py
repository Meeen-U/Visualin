from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.item import Item, ItemHistory
from app.security import get_current_user
from app.gemini_client import ask_gemini_json
from app.schemas.ai import (
    BreakdownRequest,
    BreakdownResponse,
    ProposeRequest,
    ProposeResponse,
    PredictRequest,
    PredictResponse,
)

router = APIRouter(prefix="/api/ai", tags=["AI連携"])


@router.post("/breakdown", response_model=BreakdownResponse)
def breakdown_task(
    request: BreakdownResponse,
    current_user: User = Depends(get_current_user),
):
    """
    大まかな家事名から、具体的な「名前のない家事」のリストを生成する（ユースケース4-1）。
    """
    prompt = f"""
あなたは家事の専門家です。「{request.task_name}」という大まかな家事名から、
具体的で見落としがちな「名前のない家事」のサブタスクを3〜5個考えてください。

以下のJSON形式で、日本語で回答してください。他の文章は含めないでください。
{{
  "subtasks": [
    {{"title": "サブタスクの名前", "frequency_days": 推奨される実行間隔の日数（整数）}}
  ]
}}
"""
    try:
        result = ask_gemini_json(prompt)
    except RuntimeError as e:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(e))
    
    return BreakdownResponse(
        message="家事の細分化に成功しました",
        subtasks=result.get("subtasks", []),
    )


@router.post("/propose", response_model=ProposeResponse)
def propose_tasks(
    request: ProposeResponse,
    current_user: User = Depends(get_current_user),
):
    """
    季節や住環境から、やるべき家事のリストを提案する（ユースケース4-2）。
    """
    prompt = f"""
あなたは家事の専門家です。季節「{request.season}」、住環境「{request.living_environment}」の条件で、
今のタイミングでやるべき家事を3個程度提案してください。

以下のJSON形式で、日本語で回答してください。他の文章は含めないでください。
{{
  "proposed_tasks": [
    {{"title": "家事の名前", "description": "なぜ今やるべきかの簡単な説明", "frequency_days": 推奨される実行間隔の日数（整数）}}
  ]
}}
"""
    try:
        result = ask_gemini_json(prompt)
    except RuntimeError as e:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(e))

    return ProposeResponse(
        message="おすすめの家事を提案します",
        proposed_tasks=result.get("proposed_tasks", []),
    )


@router.post("/predict", response_model=PredictResponse)
def predict_purchase_timing(
    request: PredictRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    消耗品の消費・購入履歴から、次回の購入時期を予測する（ユースケース4-3）。
    """
    item = db.query(Item).filter(Item.id == request.item_id).first()
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="消耗品が見つかりません")
    if item.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="この消耗品への操作は許可されていません")

    histories = (
        db.query(ItemHistory)
        .filter(ItemHistory.item_id == item.id)
        .order_by(ItemHistory.executed_at.desc())
        .limit(10)
        .all()
    )

    if len(histories) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="予測に必要な履歴データが不足しています",
        )

    history_text = "\n".join(
        f"- {h.executed_at}: {h.action_type} ({h.quantity_changed:+d})" for h in histories
    )

    prompt = f"""
あなたは生活アドバイザーです。以下の消耗品「{item.name}」の消費・購入履歴から、
次回の購入タイミングについて自然な文章でアドバイスしてください。

現在の残量: {item.current_stock}
アラート目安: {item.alert_threshold}
購入サイクル: {item.purchase_cycle}日

履歴（新しい順）:
{history_text}

以下のJSON形式で、日本語で回答してください。他の文章は含めないでください。
{{
  "advice": "アドバイスの文章"
}}
"""
    try:
        result = ask_gemini_json(prompt)
    except RuntimeError as e:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(e))

    return PredictResponse(
        message="購入タイミングの予測に成功しました",
        advice=result.get("advice", ""),
    )