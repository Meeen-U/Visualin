import os
import json
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
# JSONモード（response_mime_type="application/json"）は v1beta が必要なため明示的に指定する
client = genai.Client(
    api_key=GEMINI_API_KEY,
    http_options=types.HttpOptions(api_version="v1beta"),
)

MODEL_NAME = os.getenv("GEMINI_MODEL", "gemini-3.8-flash")

def ask_gemini_json(prompt: str) -> dict:
    """
    Geminiにプロンプトを送り、JSON形式で結果を受け取る共通関数
    AI連携系の３つの機能（細分化・提案・予測）は全てこれを経由する
    """
    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt,
            config={
                "response_mime_type": "application/json",
            },
        )
        return json.loads(response.text)
    except Exception as e:
        raise RuntimeError(f"Gemini APIとの通信に失敗しました: {e}")