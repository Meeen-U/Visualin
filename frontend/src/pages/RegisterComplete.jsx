import { Link } from 'react-router-dom'
import Header from '../components/Header'

function RegisterComplete() {
  return (
    <div className="container">
      <Header title="びじゅありん" />
      <div className="content">
        <div className="auth-sheet" style={{ textAlign: 'center' }}>
          <h2 className="auth-title">登録完了 🎉</h2>
          <p className="auth-lead">
            アカウントの作成が完了しました。
            <br />
            びじゅありんへようこそ！
          </p>
          <Link to="/home" className="btn" style={{ marginTop: '12px' }}>
            ホームへ移動する
          </Link>
        </div>
      </div>
    </div>
  )
}

export default RegisterComplete
