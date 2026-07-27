import os
import json
from dotenv import load_dotenv
from google import genai

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=GEMINI_API_KEY)

MODEL_NAME = "gemini-2.5-flash"

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