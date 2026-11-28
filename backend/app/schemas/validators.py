from datetime import date, datetime
from typing import Annotated, Optional
from pydantic import AfterValidator, BeforeValidator, Field, StrictBool, StringConstraints
from pydantic_core import PydanticCustomError

CATEGORY_MAX_LENGTH = 50
USERNAME_MAX_LENGTH = 50
PASSWORD_MIN_LENGTH = 8
PASSWORD_MAX_BYTES = 72  # bcrypt の仕様上限
ENTITY_ID_MAX = 2_147_483_647  # SQLite / PostgreSQL (INTEGER) 共通の32bit正整数上限


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


def normalize_optional_multiline(v: object) -> object:
    """任意の複数行文字列で改行コードをLFに統一し、前後空白除去後に空なら None に正規化する"""
    if isinstance(v, str):
        normalized = v.replace("\r\n", "\n").replace("\r", "\n").strip()
        return normalized if normalized else None
    return v


def reject_explicit_null(v: object) -> object:
    """更新リクエストで必須カラムに明示的な null が渡された場合に弾く（未指定は対象外）"""
    if v is None:
        raise PydanticCustomError("not_null", "nullは指定できません")
    return v


def _check_single_line_chars(v: str) -> str:
    """単一行テキストに改行・タブ・NUL等の制御文字が含まれていないか検証する"""
    if any(ord(ch) < 32 or ord(ch) == 127 for ch in v):
        raise PydanticCustomError(
            "control_chars_single_line",
            "改行や制御文字は使用できません",
        )
    return v


def _check_multiline_chars(v: str) -> str:
    """複数行テキストにNUL文字等の不正な制御文字が含まれていないか検証する（改行・タブは許容）"""
    if any((ord(ch) < 32 and ch not in ("\n", "\t")) or ord(ch) == 127 for ch in v):
        raise PydanticCustomError(
            "control_chars_multiline",
            "使用できない制御文字が含まれています",
        )
    return v


def _validate_optional_iso_date(v: object) -> object:
    """任意の日付項目で空文字を None に正規化し、数値タイムスタンプや日時文字列の暗黙変換を防ぐ"""
    if v is None:
        return None
    if isinstance(v, datetime) or isinstance(v, (int, float, bool)):
        raise PydanticCustomError("date_type", "正しい日付形式で入力してください")
    if isinstance(v, date):
        return v
    if isinstance(v, str):
        stripped = v.strip()
        if not stripped:
            return None
        if "T" in stripped or " " in stripped:
            raise PydanticCustomError("date_parsing", "正しい日付形式で入力してください")
        return stripped
    return v


def non_empty_single_line_str(max_length: int):
    """前後空白除去後に1文字以上・上限以内かつ改行や制御文字を含まない単一行文字列型を返す"""
    return Annotated[
        str,
        StringConstraints(strip_whitespace=True, min_length=1, max_length=max_length),
        AfterValidator(_check_single_line_chars),
    ]


def optional_single_line_str(max_length: int):
    """空文字を None に正規化し、値がある場合は上限以内・制御文字なしの単一行文字列型を返す"""
    inner = Annotated[
        str,
        StringConstraints(strip_whitespace=True, max_length=max_length),
        AfterValidator(_check_single_line_chars),
    ]
    return Annotated[Optional[inner], BeforeValidator(empty_str_to_none)]


def optional_multiline_str(max_length: int):
    """改行をLF統一・空文字を None に正規化し、上限以内・不正制御文字なしの複数行文字列型を返す"""
    inner = Annotated[
        str,
        StringConstraints(strip_whitespace=True, max_length=max_length),
        AfterValidator(_check_multiline_chars),
    ]
    return Annotated[Optional[inner], BeforeValidator(normalize_optional_multiline)]


def bounded_int(*, ge: int, le: int):
    """Field を内側・BeforeValidator を外側に配置し、OpenAPI の minimum/maximum 出力と bool 拒否を両立する"""
    return Annotated[
        int,
        Field(ge=ge, le=le),
        BeforeValidator(reject_bool),
    ]


def _check_password_bytes(v: str) -> str:
    """パスワードのUTF-8バイト数がbcryptの上限以内であることを検証する"""
    if len(v.encode("utf-8")) > PASSWORD_MAX_BYTES:
        raise PydanticCustomError(
            "password_too_long_bytes",
            "パスワードは{max_bytes}バイト以内で入力してください",
            {"max_bytes": PASSWORD_MAX_BYTES},
        )
    return v


OptionalCategoryStr = optional_single_line_str(CATEGORY_MAX_LENGTH)
OptionalIsoDate = Annotated[Optional[date], BeforeValidator(_validate_optional_iso_date)]
StrictBoolField = StrictBool
UsernameStr = non_empty_single_line_str(USERNAME_MAX_LENGTH)
PasswordStr = Annotated[
    str,
    StringConstraints(min_length=PASSWORD_MIN_LENGTH),
    AfterValidator(_check_single_line_chars),
    AfterValidator(_check_password_bytes),
]
