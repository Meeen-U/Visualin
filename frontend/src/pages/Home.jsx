import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiGet, apiPost, apiPut, apiDelete, clearToken } from '../api/client'
import { useToast } from '../contexts/ToastContext'
import { useConfirm } from '../contexts/ConfirmContext'
import TaskRegisterPanel from '../components/panels/TaskRegisterPanel'
import TaskDetailPanel from '../components/panels/TaskDetailPanel'
import TaskEditPanel from '../components/panels/TaskEditPanel'
import ItemRegisterPanel from '../components/panels/ItemRegisterPanel'
import ItemDetailPanel from '../components/panels/ItemDetailPanel'
import ItemEditPanel from '../components/panels/ItemEditPanel'

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

  const categoryOptions = [
    ...new Set(items.map((item) => item.category).filter(Boolean)),
  ]

  const showToast = useToast()
  const [openPanel, setOpenPanel] = useState(null)
  const [selectedTask, setSelectedTask] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)
  const [categoryFilter, setCategoryFilter] = useState('')

  // アラート中のものを上に、それ以外を下に並べ替えた一覧
  const filteredItems = categoryFilter
    ? items.filter((item) => item.category === categoryFilter)
    : items
  
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (a.is_alert === b.is_alert) return 0
    return a.is_alert ? -1 : 1
  })

  const alertCount = items.filter((item) => item.is_alert).length

  // Task関連関数
  function openTaskDetail(task) {
    setSelectedTask(task)
    setOpenPanel('taskDetail')
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

  async function handleUpdateTask(taskId, taskInput) {
    try {
      await apiPut(`/api/tasks/${taskId}`, taskInput)
      showToast('タスクの内容を保存しました')
      closePanel()
      loadData()
    } catch (err) {
      showToast(err.message)
    }
  }


  // Item関連関数
  function openItemDetail(item) {
    setSelectedItem(item)
    setOpenPanel('itemDetail')
  }

  async function handleCreateItem(itemInput) {
    try {
      await apiPost('/api/items', itemInput)
      showToast('消耗品を登録しました')
      closePanel()
      loadData()
    } catch (err) {
      showToast(err.message)
    }
  }

  async function handleUpdateItem(itemId, itemInput) {
    try {
      await apiPut(`/api/items/${itemId}`, itemInput)
      showToast('消耗品情報を更新しました')
      closePanel()
      loadData()
    } catch (err) {
      showToast(err.message)
    }
  }

  async function handleDeleteItem(itemId) {
    const confirmed = await showConfirm('ホウン等にこの消耗品を削除しますか？')
    if (!confirmed) return
    
    try {
      await apiDelete(`/api/items/${itemId}`)
      showToast('消耗品を削除しました')
      closePanel()
      loadData()
    } catch (err) {
      showToast(err.message)
    }
  }

  async function handleConsumeItem(itemId) {
    try {
      await apiPost(`/api/items/${itemId}/consume?quantity=1`)
      showToast('残量を1減らしました')
      closePanel()
      loadData()
    } catch (err) {
      showToast(err.message)
    }
  }

  async function handleRestockItem(itemId) {
    try {
      await apiPost(`/api/items/${itemId}/restock?restock_quantity=1`)
      showToast('購入を記録し、残量を更新しました')
      closePanel()
      loadData()
    } catch (err) {
      showToast(err.message)
    }
  }

  function closePanel() {
    setOpenPanel(null)
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h2 className="col-title title-item">
                  消耗品一覧 <span className="badge">{alertCount}</span>
                </h2>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  style={{ width: 'auto', fontSize: '0.85em', padding: '4px 8px' }}
                >
                <option value="">すべて</option>
                  {categoryOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {sortedItems.map((item) => (
                <div
                  className={item.is_alert ? 'card-item-alert' : 'card-task'}
                  key={item.item_id}
                >
                  <div className="card-title">{item.name}</div>
                  <div className={item.is_alert ? 'card-meta text-alert' : 'card-meta'}>
                    {item.is_alert
                      ? '残量目安を下回っています'
                      : `残量: ${item.current_stock}`}
                  </div>
                  <div className="flex-between" style={{ marginTop: '20px' }}>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '0.85em' }}
                      onClick={() => openItemDetail(item)}
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
                      onClick={() => handleRestockItem(item.item_id)}
                    >
                      購入完了
                    </button>
                  </div>
                </div>
              ))}

              <button 
                className="btn btn-secondary" 
                style={{ marginTop: '20px' }}
                onClick={() => setOpenPanel('itemRegister')}
              >
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

      <TaskEditPanel
        isOpen={openPanel === 'taskEdit'}
        onClose={closePanel}
        task={selectedTask}
        onSubmit={handleUpdateTask}
      />

      <ItemRegisterPanel
        isOpen={openPanel === 'itemRegister'}
        onClose={closePanel}
        onSubmit={handleCreateItem}
        categoryOptions={categoryOptions}
      />

      <ItemDetailPanel
        isOpen={openPanel === 'itemDetail'}
        onClose={closePanel}
        item={selectedItem}
        onEdit={() => setOpenPanel('itemEdit')}
        onDelete={handleDeleteItem}
        onConsume={handleConsumeItem}
        onRestock={handleRestockItem}
      />

      <ItemEditPanel
        isOpen={openPanel === 'itemEdit'}
        onClose={closePanel}
        item={selectedItem}
        onSubmit={handleUpdateItem}
        categoryOptions={categoryOptions}
      />
    </div>
  )
}

export default Home