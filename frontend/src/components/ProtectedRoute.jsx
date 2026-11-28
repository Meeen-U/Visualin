import { Navigate } from 'react-router-dom'
import { hasValidToken } from '../api/client'

/**
 * 認証が必要なページを守るためのラッパーコンポーネント
 * トークンが無い、または期限切れ・不正な場合はログイン画面へ強制的にリダイレクトする
 */
function ProtectedRoute({ children }) {
  if (!hasValidToken()) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute