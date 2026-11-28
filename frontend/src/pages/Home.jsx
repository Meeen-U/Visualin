import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiPost, clearToken } from '../api/client'
import { useToast } from '../contexts/useToast'
import { useConfirm } from '../contexts/useConfirm'
import useTasks from '../hooks/useTasks'
import useItems from '../hooks/useItems'
import useAiChat from '../hooks/useAiChat'
import TaskColumn from '../components/home/TaskColumn'
import ItemColumn from '../components/home/ItemColumn'
import AiChatColumn from '../components/home/AiChatColumn'
import TaskRegisterPanel from '../components/panels/TaskRegisterPanel'
import TaskDetailPanel from '../components/panels/TaskDetailPanel'
import TaskEditPanel from '../components/panels/TaskEditPanel'
import ItemRegisterPanel from '../components/panels/ItemRegisterPanel'
import ItemDetailPanel from '../components/panels/ItemDetailPanel'
import ItemEditPanel from '../components/panels/ItemEditPanel'

function Home() {
  const navigate = useNavigate()
  const showToast = useToast()
  const showConfirm = useConfirm()

  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  const [openPanel, setOpenPanel] = useState(null)
  const [selectedTask, setSelectedTask] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)
  const [taskInitialValues, setTaskInitialValues] = useState(null)

  const taskState = useTasks({ showToast, showConfirm })
  const itemState = useItems({ showToast, showConfirm })
  const aiChat = useAiChat({
    onRegisterTask: (value) => {
      setTaskInitialValues(value)
      setOpenPanel('taskRegister')
    },
  })

  const initialLoadersRef = useRef({
    loadTasks: taskState.loadTasks,
    loadItems: itemState.loadItems,
  })

  useEffect(() => {
    async function loadData() {
      try {
        await Promise.all([
          initialLoadersRef.current.loadTasks(),
          initialLoadersRef.current.loadItems(),
        ])
      } catch (err) {
        setErrorMessage(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  async function handleLogout() {
    try {
      await apiPost('/api/auth/logout')
    } catch {
      // ログアウトAPI失敗時もトークン破棄を行う
    } finally {
      clearToken()
      navigate('/login')
    }
  }

  function closePanel() {
    setOpenPanel(null)
  }

  function openTaskDetail(task) {
    setSelectedTask(task)
    setOpenPanel('taskDetail')
  }

  function openItemDetail(item) {
    setSelectedItem(item)
    setOpenPanel('itemDetail')
  }

  function openTaskRegister() {
    setTaskInitialValues(null)
    setOpenPanel('taskRegister')
  }

  return (
    <div className="container">
      <header>
        <span>家事可視化アプリ びじゅありん</span>
        <a
          href="#"
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
          <div className="empty-state">読み込み中...</div>
        ) : errorMessage ? (
          <div className="empty-state text-alert">{errorMessage}</div>
        ) : (
          <div className="dashboard-grid">
            <TaskColumn
              tasks={taskState.tasks}
              taskCategoryOptions={taskState.taskCategoryOptions}
              categoryFilter={taskState.categoryFilter}
              onCategoryFilterChange={taskState.handleCategoryFilterChange}
              dueFilter={taskState.dueFilter}
              onDueFilterChange={taskState.handleDueFilterChange}
              page={taskState.page}
              pageSize={taskState.pageSize}
              total={taskState.total}
              onPageChange={taskState.handlePageChange}
              onOpenDetail={openTaskDetail}
              onComplete={taskState.handleCompleteTask}
              onOpenRegister={openTaskRegister}
            />

            <ItemColumn
              items={itemState.items}
              itemCategoryOptions={itemState.itemCategoryOptions}
              categoryFilter={itemState.categoryFilter}
              onCategoryFilterChange={itemState.handleCategoryFilterChange}
              alertOnly={itemState.alertOnly}
              onAlertOnlyChange={itemState.handleAlertOnlyChange}
              alertCount={itemState.alertCount}
              page={itemState.page}
              pageSize={itemState.pageSize}
              total={itemState.total}
              onPageChange={itemState.handlePageChange}
              onOpenDetail={openItemDetail}
              onConsume={(itemId) => itemState.handleConsumeItem(itemId, closePanel)}
              onRestock={(itemId) => itemState.handleRestockItem(itemId, closePanel)}
              onOpenRegister={() => setOpenPanel('itemRegister')}
            />

            <AiChatColumn
              chatMessages={aiChat.chatMessages}
              chatInput={aiChat.chatInput}
              onChatInputChange={aiChat.setChatInput}
              onChatKeyPress={aiChat.handleChatKeyPress}
              isAiLoading={aiChat.isAiLoading}
              chatAreaRef={aiChat.chatAreaRef}
              onSendChat={aiChat.handleSendChat}
              onClearChat={aiChat.clearChat}
              onRegisterSubtask={aiChat.openTaskRegisterFromSubtask}
              showSeasonForm={aiChat.showSeasonForm}
              onShowSeasonForm={aiChat.setShowSeasonForm}
              season={aiChat.season}
              onSeasonChange={aiChat.setSeason}
              livingEnvironment={aiChat.livingEnvironment}
              onLivingEnvironmentChange={aiChat.setLivingEnvironment}
              onProposeTasks={aiChat.handleProposeTasks}
            />
          </div>
        )}
      </div>

      <TaskRegisterPanel
        isOpen={openPanel === 'taskRegister'}
        onClose={closePanel}
        onSubmit={(input) => taskState.handleCreateTask(input, closePanel)}
        categoryOptions={taskState.taskCategoryOptions}
        initialValues={taskInitialValues}
      />

      <TaskDetailPanel
        isOpen={openPanel === 'taskDetail'}
        onClose={closePanel}
        task={selectedTask}
        onEdit={() => setOpenPanel('taskEdit')}
        onDelete={(taskId) => taskState.handleDeleteTask(taskId, closePanel)}
      />

      <TaskEditPanel
        isOpen={openPanel === 'taskEdit'}
        onClose={closePanel}
        task={selectedTask}
        onSubmit={(taskId, input) => taskState.handleUpdateTask(taskId, input, closePanel)}
        categoryOptions={taskState.taskCategoryOptions}
      />

      <ItemRegisterPanel
        isOpen={openPanel === 'itemRegister'}
        onClose={closePanel}
        onSubmit={(input) => itemState.handleCreateItem(input, closePanel)}
        categoryOptions={itemState.itemCategoryOptions}
      />

      <ItemDetailPanel
        isOpen={openPanel === 'itemDetail'}
        onClose={closePanel}
        item={selectedItem}
        onEdit={() => setOpenPanel('itemEdit')}
        onDelete={(itemId) => itemState.handleDeleteItem(itemId, closePanel)}
        onConsume={(itemId) => itemState.handleConsumeItem(itemId, closePanel)}
        onRestock={(itemId) => itemState.handleRestockItem(itemId, closePanel)}
      />

      <ItemEditPanel
        isOpen={openPanel === 'itemEdit'}
        onClose={closePanel}
        item={selectedItem}
        onSubmit={(itemId, input) => itemState.handleUpdateItem(itemId, input, closePanel)}
        categoryOptions={itemState.itemCategoryOptions}
      />
    </div>
  )
}

export default Home