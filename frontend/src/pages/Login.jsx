import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Header from '../components/Header'
import { apiPost, saveToken } from '../api/client'

function Login() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      const data = await apiPost('/api/auth/login', { email, password })
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
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>ログイン</h2>

        <form onSubmit={handleLogin}>
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
            <p style={{ color: '#9E4A34', fontSize: '0.9em' }}>{errorMessage}</p>
          ) : null}

          <button type="submit" className="btn" disabled={isSubmitting}>
            {isSubmitting ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>

        <Link to="/password-reset" className="link-text">パスワードを忘れた場合</Link>
        <Link to="/register" className="link-text">新規登録はこちら</Link>
      </div>
    </div>
  )
}

export default Login