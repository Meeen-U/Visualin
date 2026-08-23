import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Header from '../components/Header'
import { apiPost, saveToken } from '../api/client'

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

    if (password !== passwordConfirm) {
      setErrorMessage('パスワードが一致しません')
      return
    }

    setIsSubmitting(true)
    try {
      const data = await apiPost('/api/auth/register', { name, email, password })
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
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>新規アカウント登録</h2>

        <form onSubmit={handleRegister}>
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
            <p style={{ color: '#9E4A34', fontSize: '0.9em' }}>{errorMessage}</p>
          ) : null}

          <button type="submit" className="btn" disabled={isSubmitting}>
            {isSubmitting ? '登録中...' : 'アカウントを作成'}
          </button>
        </form>

        <Link to="/login" className="link-text">すでにアカウントをお持ちの方（ログイン）</Link>
      </div>
    </div>
  )
}

export default Register