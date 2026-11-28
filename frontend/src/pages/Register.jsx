import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Header from '../components/Header'
import { apiPost, saveToken } from '../api/client'
import {
  PASSWORD_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
  validateEmail,
  validatePassword,
  validatePasswordConfirm,
} from '../utils/validation'

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

    const trimmedName = name.trim()
    if (!trimmedName) {
      setErrorMessage('ユーザー名を入力してください')
      return
    }
    if (trimmedName.length > USERNAME_MAX_LENGTH) {
      setErrorMessage(`ユーザー名は${USERNAME_MAX_LENGTH}文字以内で入力してください`)
      return
    }

    const emailError = validateEmail(email)
    if (emailError) {
      setErrorMessage(emailError)
      return
    }

    const passwordError = validatePassword(password)
    if (passwordError) {
      setErrorMessage(passwordError)
      return
    }

    const confirmError = validatePasswordConfirm(password, passwordConfirm)
    if (confirmError) {
      setErrorMessage(confirmError)
      return
    }

    setIsSubmitting(true)
    try {
      const data = await apiPost('/api/auth/register', {
        name: trimmedName,
        email: email.trim(),
        password,
        password_confirm: passwordConfirm,
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
                maxLength={USERNAME_MAX_LENGTH}
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
                placeholder={`${PASSWORD_MIN_LENGTH}文字以上`}
                minLength={PASSWORD_MIN_LENGTH}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>パスワード（確認用）</label>
              <input
                type="password"
                placeholder="もう一度入力してください"
                minLength={PASSWORD_MIN_LENGTH}
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
