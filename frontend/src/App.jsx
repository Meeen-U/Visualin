import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import PasswordReset from './pages/PasswordReset'
import Register from './pages/Register'
import RegisterComplete from './pages/RegisterComplete'
import Home from './pages/Home'
import TaskRegister from './pages/TaskRegister'
import TaskDetail from './pages/TaskDetail'
import TaskEdit from './pages/TaskEdit'
import ItemRegister from './pages/ItemRegister'
import ItemDetail from './pages/ItemDetail'
import ItemEdit from './pages/ItemEdit'
import AiIntegration from './pages/AiIntegration'

function App() {
  return (
    <Routes>
      {/* ルート直下にアクセスされたらログイン画面へ */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/login" element={<Login />} />
      <Route path="/password-reset" element={<PasswordReset />} />
      <Route path="/register" element={<Register />} />
      <Route path="/register-complete" element={<RegisterComplete />} />

      <Route path="/home" element={<Home />} />

      <Route path="/tasks/new" element={<TaskRegister />} />
      <Route path="/tasks/:taskId" element={<TaskDetail />} />
      <Route path="/tasks/:taskId/edit" element={<TaskEdit />} />

      <Route path="/items/new" element={<ItemRegister />} />
      <Route path="/items/:itemId" element={<ItemDetail />} />
      <Route path="/items/:itemId/edit" element={<ItemEdit />} />

      <Route path="/ai" element={<AiIntegration />} />
    </Routes>
  )
}

export default App