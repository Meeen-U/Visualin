import { useState, useEffect, useRef } from 'react'
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

  async function handleLogout() {
    try {
      await apiPost('/api/auth/logout')
    } catch (err){
      // ログアウトAPIが失敗しても、クライアント側のトークン破棄は必ず行う
    } finally {
      clearToken()
      navigate('/login')
    }
  }

  const taskCategoryOptions = [
    ...new Set(tasks.map((task) => task.category).filter(Boolean)),
  ]

  const itemCategoryOptions = [
    ...new Set(items.map((item) => item.category).filter(Boolean)),
  ]

  const showToast = useToast()
  const [openPanel, setOpenPanel] = useState(null)
  const [selectedTask, setSelectedTask] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)
  const [categoryFilter, setCategoryFilter] = useState('')
  const [taskCategoryFilter, setTaskCategoryFilter] = useState('')

  const filteredTasks = taskCategoryFilter
    ? tasks.filter((task) => task.category === taskCategoryFilter)
    : tasks
  
  // 次回予定日が近いものを上に表示
  const sortedTasks = [...filteredTasks].sort((a,b) => {
    if (!a.next_due_date) return -1
    if (!b.next_due_date) return 1
    return new Date(a.next_due_date) - new Date(b.next_due_date)
  })

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

  async function handleCompleteTask(taskId) {
    try {
      await apiPost(`/api/tasks/${taskId}/complete`)
      showToast('タスクを完了として記録しました')
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
    const confirmed = await showConfirm('本等にこの消耗品を削除しますか？')
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

  // AI関連関数
    const [chatMessage, setChatMessages] = useState([
      { id: 0, role: 'ai', text: 'アシスタントAIです。タスクを細かく分けます'}
    ])
    const [chatInput, setChatInput] = useState('')
    const [isAiLoading, setIsAiLoading] = useState(false)
    const [taskInitialValues, setTaskInitialValues] = useState(null)
    const [showSeasonForm, setShowSeasonForm] = useState(false)
    const [season, setSeason] = useState('夏')
    const [livingEnvironment, setLivingEnvironment] = useState('一人暮らし')
    const chatAreaRef = useRef(null)
    const chatMessageIdRef = useRef(1)

    useEffect(() => {
      if (chatAreaRef.current) {
        chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight
      }
    }, [chatMessage])

    // AIチャットのハンドラー
    function addChatMessage(role, text, subtasks = null) {
      const id = chatMessageIdRef.current++
      setChatMessages((prev) => [...prev, { id, role, text, subtasks }])
    }

    async function handleSendChat() {
      const text = chatInput.trim()
      if (!text || isAiLoading) return

      addChatMessage('user', text)
      setChatInput('')
      setIsAiLoading(true)

      try {
        const result = await apiPost('/api/ai/breakdown', { task_name: text })
        addChatMessage(
          'ai',
          `「${text}」の細分化`,
          result.subtasks
        )
      } catch (err) {
        addChatMessage('ai', `すみません。うまく処理できませんでした(${err.message})`)
      } finally {
        setIsAiLoading(false)
      }
    }

  async function handleProposeTasks() {
    setShowSeasonForm(false)
    addChatMessage('user', `季節「${season}」・住環境「${livingEnvironment}」でおすすめの家事を教えて`)
    setIsAiLoading(true)

    try {
      const result = await apiPost('/api/ai/propose', {
        season,
        living_environment: livingEnvironment,
      })
      const subtasks = result.proposed_tasks.map((t) => ({
        title: t.title,
        frequency_days: t.frequency_days,
        description: t.description,
      }))
      addChatMessage('ai', 'この季節・住環境ですと、こんな家事がおすすめです。', subtasks)
    } catch (err) {
      addChatMessage('ai', `すみません、うまく処理できませんでした（${err.message}）`)
    } finally {
      setIsAiLoading(false)
    }
  }

    function handleChatKeyPress(e) {
      if (e.key === 'Enter') handleSendChat()
    }

    function clearChat() {
      setChatMessages([
        { id: 0, role: 'ai', text: '新しいチャットを開始しました。'}
      ])
      chatMessageIdRef.current = 1
    }

    function openTaskRegisterFromSubtask(subtask) {
      setTaskInitialValues({ title: subtask.title, frequency_days: subtask.frequency_days})
      setOpenPanel('taskRegister')
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h2 className="col-title title-task">今日の家事タスク</h2>
                <select
                  value={taskCategoryFilter}
                  onChange={(e) => setTaskCategoryFilter(e.target.value)}
                  style={{ width: 'auto', fontSize: '0.85em', padding: '4px 8px' }}
                >
                  <option value="">すべて</option>
                  {taskCategoryOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {sortedTasks.length === 0 ? (
                <p style={{ color: '#6E6055', fontSize: '0.9em' }}>
                    {tasks.length === 0
                      ? 'まだタスクが登録されていません'
                      : 'このカテゴリのタスクはありません'
                    }
                </p>
              ) : null}

              {sortedTasks.map((task) => (
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
                      onClick={() => handleCompleteTask(task.task_id)}
                    >
                      完了する
                    </button>
                  </div>
                </div>
              ))}

              <button 
                className="btn btn-secondary"
                style={{ marginTop: '20px' }}
                onClick={() => {
                  setTaskInitialValues(null)
                  setOpenPanel('taskRegister')
                }}  
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
                  {itemCategoryOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {sortedItems.length === 0 ? (
                <p style={{ color: '#6E6055', fontSize: '0.9em' }}>
                  {items.length === 0
                    ? 'まだ消耗品が登録されていません'
                    : 'このカテゴリの消耗品はありません'
                  }
                </p>
              ) : null}

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
                  <div className="flex-between" style={{ marginTop: '20px', gap: '8px' }}>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '0.85em', margin: 0 }}
                      onClick={() => openItemDetail(item)}
                    >
                      詳細・変更
                    </button>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '6px 10px', fontSize: '0.85em', margin: 0}}
                      onClick={() => handleConsumeItem(item.item_id)}
                    >
                      ➖ 1つ使う
                    </button>
                    <button
                      className="btn"
                      style={{
                        backgroundColor: '#6E5447',
                        padding: '6px 12px',
                        fontSize: '0.85em',
                        borderColor: '#40342B',
                        margin: 0,
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
                  <button className="chat-new-btn" onClick={clearChat}>
                    新規チャット
                  </button>
                </div>

                <div className="chat-messages" ref={chatAreaRef}>
                  {chatMessage.map((msg) => (
                    <div
                      key={msg.id}
                      className={msg.role === 'user' ? 'chat-bubble chat-user' : 'chat-bubble chat-ai'}
                    >
                      {msg.text}
                      {msg.subtasks
                        ? msg.subtasks.map((subtask, index) => (
                          <div
                            key={index}
                            style={{
                              border: '1px solid #D6CDC4',
                              padding: '10px',
                              background: '#FFFFFF',
                              marginTop: '10px',
                            }}
                          >
                            {subtask.title} (推奨頻度: {subtask.frequency_days}日)
                            {subtask.description ? (
                              <p style={{ fontSize: '0.85em', color: '#6E6055', margin: '5px 0 0 0' }}>
                                {subtask.description}
                              </p>
                            ) : null}
                            <button
                              className="btn btn-secondary"
                              style={{ padding: '4px 8px', fontSize: '0.8em', marginTop: '5px' }}
                              onClick={() => openTaskRegisterFromSubtask(subtask)}
                            >
                              タスクに登録
                            </button>
                          </div>
                        ))
                      : null}
                    </div>
                  ))}
                  {isAiLoading ? (
                    <div className="chat-bubble chat-ai">考え中...</div>
                  ) : null}
                </div>

                {showSeasonForm ? (
                  <div style={{ padding: '15px', borderTop: '2px solid #40342B', background: '#F5F2EB' }}>
                    <div className="form-group" style={{ marginBottom: '10px' }}>
                      <label style={{ fontSize: '0.85em' }}>季節</label>
                      <select value={season} onChange={(e) => setSeason(e.target.value)}>
                        <option>春</option>
                        <option>夏</option>
                        <option>秋</option>
                        <option>冬</option>
                      </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: '10px' }}>
                      <label style={{ fontSize: '0.85em' }}>住環境</label>
                      <select value={livingEnvironment} onChange={(e) => setLivingEnvironment(e.target.value)}>
                        <option>一人暮らし</option>
                        <option>ファミリー世帯</option>
                        <option>ペットあり</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        className="btn btn-secondary"
                        style={{ margin: 0, flex: 1 }}
                        onClick={() => setShowSeasonForm(false)}
                      >
                        キャンセル
                      </button>
                      <button className="btn" style={{ margin: 0, flex: 1 }} onClick={handleProposeTasks}>
                        提案してもらう
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    className="chat-new-btn"
                    style={{ margin: '10px 15px 0 15px', color: '#40342B', borderColor: '#40342B' }}
                    onClick={() => setShowSeasonForm(true)}
                  >
                    🍃 季節の家事を提案してもらう
                  </button>
                )}

                <div className="chat-input-area">
                  <input
                    type="text"
                    placeholder="入力例：車内の清掃、衣替え"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={handleChatKeyPress}
                  />
                  <button className="btn" onClick={handleSendChat}>
                    送信
                  </button>
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
        categoryOptions={taskCategoryOptions}
        initialValues={taskInitialValues}
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
        categoryOptions={taskCategoryOptions}
      />

      <ItemRegisterPanel
        isOpen={openPanel === 'itemRegister'}
        onClose={closePanel}
        onSubmit={handleCreateItem}
        categoryOptions={itemCategoryOptions}
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
        categoryOptions={itemCategoryOptions}
      />
    </div>
  )
}

export default Home