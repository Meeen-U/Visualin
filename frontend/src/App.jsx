import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import PasswordReset from './pages/PasswordReset'
import Register from './pages/Register'
import RegisterComplete from './pages/RegisterComplete'
import Home from './pages/Home'

function App() {
  return (
    <Routes>
      {/* ルート直下にアクセスされたらログイン画面へ */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/login" element={<Login />} />
      <Route path="/password-reset" element={<PasswordReset />} />
      <Route path="/register" element={<Register />} />
      <Route path="/register-complete" element={<RegisterComplete />} />

      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default App
