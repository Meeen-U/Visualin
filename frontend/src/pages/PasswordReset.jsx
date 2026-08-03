import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Header from '../components/Header'
import { apiPost } from '../api/client'
import { useToast } from '../contexts/ToastContext'

function PasswordReset() {
  const navigate = useNavigate()
  const showToast = useToast()

  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleReset(e) {
    e.preventDefault()
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      await apiPost('/api/auth/password-reset', {
        email,
        new_password: newPassword,
      })
      showToast('パスワードを再設定しました')
      navigate('/login')
    } catch (err) {
      setErrorMessage(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container">
      <Header title="びじゅありん" />
      <div className="content">
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>パスワードリセット</h2>
        <p style={{ fontSize: '0.9em', color: '#666', lineHeight: '1.5' }}>
          登録しているメールアドレスと、新しいパスワードを入力してください。
        </p>

        <form onSubmit={handleReset}>
          <div className="form-group" style={{ marginTop: '20px' }}>
            <label>メールアドレス</label>
            <input
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>新しいパスワード</label>
            <input
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          {errorMessage ? (
            <p style={{ color: '#9E4A34', fontSize: '0.9em' }}>{errorMessage}</p>
          ) : null}

          <button type="submit" className="btn" disabled={isSubmitting}>
            {isSubmitting ? '送信中...' : 'パスワードを再設定する'}
          </button>
        </form>

        <Link to="/login" className="link-text">ログイン画面に戻る</Link>
      </div>
    </div>
  )
}

export default PasswordReset