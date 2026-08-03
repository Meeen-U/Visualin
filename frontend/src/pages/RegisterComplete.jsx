import { Link } from 'react-router-dom'
import Header from '../components/Header'

function RegisterComplete() {
  return (
    <div className="container">
      <Header title="びじゅありん" />
      <div className="content" style={{ textAlign: 'center', paddingTop: '50px' }}>
        <h2 style={{ marginBottom: '20px' }}>登録完了</h2>
        <p style={{ color: '#555', lineHeight: '1.6' }}>
          アカウントの作成が完了しました。
          <br />
          びじゅありんへようこそ！
        </p>
        <Link to="/home" className="btn" style={{ marginTop: '40px' }}>
          ホームへ移動する
        </Link>
      </div>
    </div>
  )
}

export default RegisterComplete