import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Header from '../components/Header'
import { apiPost } from '../api/client'
import { useToast } from '../contexts/useToast'
import { validateEmail } from '../utils/validation'

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

    const emailError = validateEmail(email)
    if (emailError) {
      setErrorMessage(emailError)
      return
    }

    if (!newPassword) {
      setErrorMessage('新しいパスワードを入力してください')
      return
    }

    setIsSubmitting(true)

    try {
      await apiPost('/api/auth/password-reset', {
        email: email.trim(),
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
        <div className="auth-sheet">
          <h2 className="auth-title">パスワードリセット</h2>
          <p className="auth-lead">
            登録しているメールアドレスと、新しいパスワードを入力してください。
          </p>

          <form onSubmit={handleReset} noValidate>
            <div className="form-group">
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
              <p className="text-alert" style={{ fontSize: '0.9rem', margin: '0 0 14px' }}>
                {errorMessage}
              </p>
            ) : null}

            <button type="submit" className="btn" disabled={isSubmitting}>
              {isSubmitting ? '送信中...' : 'パスワードを再設定する'}
            </button>
          </form>

          <div className="auth-links">
            <Link to="/login" className="link-text">
              ログイン画面に戻る
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PasswordReset
