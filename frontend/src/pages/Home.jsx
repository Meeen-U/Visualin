import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiGet, apiPost, apiDelete, clearToken } from '../api/client'
import { useToast } from '../contexts/ToastContext'
import { useConfirm } from '../contexts/ConfirmContext'
import TaskRegisterPanel from '../components/panels/TaskRegisterPanel'
import TaskDetailPanel from '../components/panels/TaskDetailPanel'

function Home() {
  const navigate = useNavigate()

  const [tasks, setTasks] = useState([])
  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const showConfirm = useConfirm()

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setIsLoading(true)
    setErrorMessage('')
    try {
      const [taskData, itemData] = await Promise.all([
        apiGet('/api/tasks'),
        apiGet('/api/items'),
      ])
      setTasks(taskData.tasks)
      setItems(itemData.items)
    } catch (err) {
      setErrorMessage(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  function handleLogout() {
    clearToken()
    navigate('/login')
  }

  const alertItems = items.filter((item) => item.is_alert)
  const showToast = useToast()
  const [openPanel, setOpenPanel] = useState(null)
  const [selectedTask, setSelectedTask] = useState(null)

  function openTaskDetail(task) {
    console.log('clicked', task)
    setSelectedTask(task)
    setOpenPanel('taskDetail')
  }

  async function handleDeleteTask(taskId) {
    const confirmed = await showConfirm('本当にこのタスクを削除しますか?')
    if (!confirmed) return

    try {
      await apiDelete(`/api/tasks/${taskId}`)
      showToast('タスクを削除しました')
      closePanel()
      loadData()
    } catch (err) {
      showToast(err.message)
    }
  }

  function closePanel() {
    setOpenPanel(null)
  }

  async function handleCreateTask(taskInput){
    try {
      await apiPost('/api/tasks', taskInput)
      showToast('新しいタスクを登録しました')
      closePanel()
      loadData()
    } catch (err) {
      showToast(err.message)
    }
  }

  return (
    <div className="container">
      <header>
        <div style={{ width: '80px' }}></div>
        <div>家事可視化アプリ びじゅありん</div>
        <a
          href="#"
          style={{ width: '80px', textAlign: 'right' }}
          onClick={(e) => {
            e.preventDefault()
            handleLogout()
          }}
        >
          ログアウト
        </a>
      </header>

      <div className="content">
        {isLoading ? (
          <p>読み込み中...</p>
        ) : errorMessage ? (
          <p style={{ color: '#9E4A34' }}>{errorMessage}</p>
        ) : (
          <div className="dashboard-grid">
            {/* タスク列 */}
            <div className="dashboard-col">
              <h2 className="col-title title-task">今日の家事タスク</h2>

              {tasks.map((task) => (
                <div className="card-task" key={task.task_id}>
                  <div className="card-title">{task.title}</div>
                  <div className="card-meta">
                    期限: {task.next_due_date ?? '未設定'} ({task.frequency_days}日おき)
                  </div>
                  {task.description ? (
                    <p
                      style={{
                        fontSize: '0.9em',
                        color: '#40342B',
                        margin: '0 0 18px 0',
                        lineHeight: '1.7',
                        borderBottom: '1px dashed #D6CDC4',
                        paddingBottom: '10px',
                      }}
                    >
                      {task.description}
                    </p>
                  ) : null}
                  <div className="flex-between">
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '0.85em' }}
                      onClick={() => openTaskDetail(task)}
                    >
                      詳細を見る
                    </button>
                    <button
                      className="btn"
                      style={{ padding: '6px 15px', fontSize: '0.85em' }}
                    >
                      完了する
                    </button>
                  </div>
                </div>
              ))}

              <button 
                className="btn btn-secondary"
                style={{ marginTop: '20px' }}
                onClick={() => setOpenPanel('taskRegister')}  
              >
                タスクを新規登録
              </button>
            </div>

            {/* 消耗品列 */}
            <div className="dashboard-col">
              <h2 className="col-title title-item">
                消耗品アラート <span className="badge">{alertItems.length}</span>
              </h2>

              {alertItems.map((item) => (
                <div className="card-item-alert" key={item.item_id}>
                  <div className="card-title">{item.name}</div>
                  <div className="card-meta text-alert">残量目安を下回っています</div>
                  <div className="flex-between" style={{ marginTop: '20px' }}>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '0.85em' }}
                    >
                      詳細・変更
                    </button>
                    <button
                      className="btn"
                      style={{
                        backgroundColor: '#6E5447',
                        padding: '6px 15px',
                        fontSize: '0.85em',
                        borderColor: '#40342B',
                      }}
                    >
                      購入完了
                    </button>
                  </div>
                </div>
              ))}

              <button className="btn btn-secondary" style={{ marginTop: '20px' }}>
                消耗品を新規登録
              </button>
            </div>

            {/* AIチャット列（次のステップで実装） */}
            <div
              className="dashboard-col"
              style={{ padding: 0, border: 'none', background: 'transparent', boxShadow: 'none' }}
            >
              <div className="chat-container">
                <div className="chat-header">
                  <span>AI アシスト</span>
                </div>
                <div className="chat-messages">
                  <div className="chat-bubble chat-ai">
                    （作成中）
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <TaskRegisterPanel
        isOpen={openPanel === 'taskRegister'}
        onClose={closePanel}
        onSubmit={handleCreateTask}
      />

      <TaskDetailPanel
        isOpen={openPanel === 'taskDetail'}
        onClose={closePanel}
        task={selectedTask}
        onEdit={() => setOpenPanel('taskEdit')}
        onDelete={handleDeleteTask}
      />
    </div>
  )
}

export default Home