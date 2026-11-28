import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Header from '../components/Header'
import { apiPost, saveToken, consumeAuthNotice } from '../api/client'
import { validateEmail } from '../utils/validation'

function Login() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState(() => consumeAuthNotice())
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setErrorMessage('')

    const emailError = validateEmail(email)
    if (emailError) {
      setErrorMessage(emailError)
      return
    }

    if (!password) {
      setErrorMessage('パスワードを入力してください')
      return
    }

    setIsSubmitting(true)

    try {
      const data = await apiPost('/api/auth/login', { email: email.trim(), password })
      saveToken(data.access_token)
      navigate('/home')
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
          <h2 className="auth-title">ログイン</h2>

          <form onSubmit={handleLogin} noValidate>
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

            {errorMessage ? (
              <p className="text-alert" style={{ fontSize: '0.9rem', margin: '0 0 14px' }}>
                {errorMessage}
              </p>
            ) : null}

            <button type="submit" className="btn" disabled={isSubmitting}>
              {isSubmitting ? 'ログイン中...' : 'ログイン'}
            </button>
          </form>

          <div className="auth-links">
            <Link to="/password-reset" className="link-text">
              パスワードを忘れた場合
            </Link>
            <Link to="/register" className="link-text">
              新規登録はこちら
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
