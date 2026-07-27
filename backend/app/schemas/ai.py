from typing import Optional
from pydantic import BaseModel

class BreakdownRequest(BaseModel):
    """家事の細分化リクエスト"""
    task_name: str


class SubtaskItem(BaseModel):
    title: str
    frequency_days: int


class BreakdownResponse(BaseModel):
    message: str
    subtasks: list[SubtaskItem]


class ProposeRequest(BaseModel):
    """家事の提案リクエスト"""
    season: str
    living_environment: str


class ProposedTaskItem(BaseModel):
    title: str
    description: str
    frequency_days: int


class ProposeResponse(BaseModel):
    message: str
    proposed_tasks: list[ProposedTaskItem]


class PredictRequest(BaseModel):
    """消耗品の購入タイミング予測リクエスト"""
    item_id: int


class PredictResponse(BaseModel):
    message: str
    advice: str