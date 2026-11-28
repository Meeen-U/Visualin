// バックエンドAPIのベースURL（環境変数未設定時はローカル開発用URLにフォールバック）
const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'
).replace(/\/+$/, '')

/**
 * ログイン中のユーザーのアクセストークンをブラウザに保存する処理
 * まずは localStorage を使う（保存し忘れ対策として最もシンプルな方法）
 */
const TOKEN_KEY = 'visualin_access_token'

export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

/**
 * バックエンドのエラーレスポンスから表示用の文字列を安全に取り出す
 * FastAPIの422エラーは detail が配列（オブジェクト配列）で返る場合があるため、
 * そのまま文字列化して "[object Object]" になるのを防ぐ
 */
function extractErrorMessage(data, status) {
  const detail = data?.detail

  if (typeof detail === 'string' && detail.trim()) {
    return detail
  }

  if (Array.isArray(detail) && detail.length > 0) {
    const emailError = detail.find(
      (item) => Array.isArray(item?.loc) && item.loc.includes('email')
    )
    if (emailError) {
      return 'メールアドレスの形式が正しくありません。「@」と「.com」などのドメインを含めて入力してください（例: example@email.com）'
    }
    const messages = detail
      .map((item) => (typeof item?.msg === 'string' ? item.msg : ''))
      .filter(Boolean)
    if (messages.length > 0) {
      return messages.join(' / ')
    }
  }

  return `APIエラーが発生しました（${status}）`
}

/**
 * APIリクエストの共通処理
 *
 * path: "/api/tasks" のようなパス部分
 * options: fetchに渡すオプション（method, bodyなど）。認証ヘッダーは自動で付与される
 */
async function apiFetch(path, options = {}) {
  const token = getToken()

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }

  // トークンがあれば自動的にAuthorizationヘッダーを付与する
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  })

  // レスポンスをJSONとして読み取る（エラー時もdetailメッセージを読みたいので先に読む）
  const data = await response.json().catch(() => null)

  if (!response.ok) {
    const message = extractErrorMessage(data, response.status)
    throw new Error(message)
  }

  return data
}

// 各種HTTPメソッド用のショートカット関数
export function apiGet(path) {
  return apiFetch(path, { method: 'GET' })
}

export function apiPost(path, body) {
  return apiFetch(path, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  })
}

export function apiPut(path, body) {
  return apiFetch(path, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

export function apiDelete(path) {
  return apiFetch(path, { method: 'DELETE' })
}