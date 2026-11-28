import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Header from '../components/Header'
import { apiPost, saveToken } from '../api/client'
import { validateEmail } from '../utils/validation'

function Register() {
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleRegister(e) {
    e.preventDefault()
    setErrorMessage('')

    if (!name.trim()) {
      setErrorMessage('ユーザー名を入力してください')
      return
    }

    const emailError = validateEmail(email)
    if (emailError) {
      setErrorMessage(emailError)
      return
    }

    if (!password) {
      setErrorMessage('パスワードを入力してください')
      return
    }

    if (password !== passwordConfirm) {
      setErrorMessage('パスワードが一致しません')
      return
    }

    setIsSubmitting(true)
    try {
      const data = await apiPost('/api/auth/register', {
        name: name.trim(),
        email: email.trim(),
        password,
      })
      saveToken(data.access_token)
      navigate('/register-complete')
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
          <h2 className="auth-title">新規アカウント登録</h2>

          <form onSubmit={handleRegister} noValidate>
            <div className="form-group">
              <label>ユーザー名</label>
              <input
                type="text"
                placeholder="例：タロウ"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
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
              <label>パスワード</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>パスワード（確認用）</label>
              <input
                type="password"
                placeholder="••••••••"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                required
              />
            </div>

            {errorMessage ? (
              <p className="text-alert" style={{ fontSize: '0.9rem', margin: '0 0 14px' }}>
                {errorMessage}
              </p>
            ) : null}

            <button type="submit" className="btn" disabled={isSubmitting}>
              {isSubmitting ? '登録中...' : 'アカウントを作成'}
            </button>
          </form>

          <div className="auth-links">
            <Link to="/login" className="link-text">
              すでにアカウントをお持ちの方（ログイン）
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
