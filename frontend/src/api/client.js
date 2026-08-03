// バックエンドAPIのベースURL
const API_BASE_URL = 'http://127.0.0.1:8000'

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
    // バックエンドのエラーは { "detail": "エラーメッセージ" } の形式で返る
    const message = data?.detail || `APIエラーが発生しました（${response.status}）`
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