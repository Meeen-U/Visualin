import { Navigate } from 'react-router-dom'
import { getToken } from '../api/client'

/**
 * 認証が必要なページを守るためのラッパーコンポーネント
 * トークンが無い（未ログイン）場合はログイン画面へ強制的にリダイレクトする
 */
function ProtectedRoute({ children }) {
  const token = getToken()

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute