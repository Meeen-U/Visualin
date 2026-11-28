from typing import Annotated, Optional
from pydantic import BeforeValidator, StringConstraints
from pydantic_core import PydanticCustomError

CATEGORY_MAX_LENGTH = 50


def reject_bool(v: object) -> object:
    """Pythonでは bool が int のサブクラスのため、数値項目への true/false 混入を防ぐ"""
    if isinstance(v, bool):
        raise PydanticCustomError("int_type", "整数を入力してください")
    return v


def empty_str_to_none(v: object) -> object:
    """任意入力の文字列項目で、前後空白を除去したうえで空文字を None に正規化する"""
    if isinstance(v, str):
        stripped = v.strip()
        return stripped if stripped else None
    return v


def reject_explicit_null(v: object) -> object:
    """更新リクエストで必須カラムに明示的な null が渡された場合に弾く（未指定は対象外）"""
    if v is None:
        raise PydanticCustomError("not_null", "nullは指定できません")
    return v


OptionalCategoryStr = Annotated[
    Optional[
        Annotated[
            str,
            StringConstraints(strip_whitespace=True, max_length=CATEGORY_MAX_LENGTH),
        ]
    ],
    BeforeValidator(empty_str_to_none),
]
