import { Navigate } from 'react-router-dom'
import { hasValidToken } from '../api/client'

/**
 * 未ログインユーザー向けページのラッパーコンポーネント
 * ログイン済み（有効なトークン保持時）にアクセスされた場合はホーム画面へリダイレクトする
 */
function PublicOnlyRoute({ children }) {
  if (hasValidToken()) {
    return <Navigate to="/home" replace />
  }

  return children
}

export default PublicOnlyRoute
