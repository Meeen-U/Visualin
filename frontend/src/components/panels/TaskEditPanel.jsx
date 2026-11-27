import { useState } from 'react'
import FloatingPanel from '../FloatingPanel'

function TaskEditForm({ task, onSubmit, categoryOptions }) {
  const [title, setTitle] = useState(task.title ?? '')
  const [category, setCategory] = useState(task.category ?? '')
  const [dueDate, setDueDate] = useState(task.next_due_date ?? '')
  const [frequency, setFrequency] = useState(task.frequency_days ?? '')
  const [description, setDescription] = useState(task.description ?? '')

  function handleSubmit() {
    onSubmit(task.task_id, {
      title,
      category,
      next_due_date: dueDate || null,
      frequency_days: Number(frequency),
      description: description || null,
    })
  }

  return (
    <>
      <div className="form-group">
        <label>家事の名前</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>カテゴリ</label>
        <input
          type="text"
          list="task-category-options-edit"
          placeholder="例：水回り"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <datalist id="task-category-options-edit">
          {categoryOptions.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </div>
      <div className="form-group">
        <label>説明</label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>次回予定日</label>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>繰り返し間隔 (日)</label>
        <input
          type="number"
          value={frequency}
          onChange={(e) => setFrequency(e.target.value)}
        />
      </div>
      <button type="button" className="btn" onClick={handleSubmit}>
        変更を保存
      </button>
    </>
  )
}

function TaskEditPanel({ isOpen, onClose, task, onSubmit, categoryOptions = [] }) {
  if (!task) return null

  return (
    <FloatingPanel
      title="タスク編集"
      isOpen={isOpen}
      onClose={onClose}
      initialTop="25%"
      initialLeft="35%"
    >
      <TaskEditForm
        key={task.task_id}
        task={task}
        onSubmit={onSubmit}
        categoryOptions={categoryOptions}
      />
    </FloatingPanel>
  )
}

export default TaskEditPanel
