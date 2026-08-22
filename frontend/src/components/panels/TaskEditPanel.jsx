import { useState, useEffect } from 'react'
import FloatingPanel from '../FloatingPanel'

function TaskEditPanel({ isOpen, onClose, task, onSubmit, categoryOptions = [] }) {
    const [title, setTitle] = useState('')
    const [category, setCategory] = useState('')
    const [dueDate, setDueDate] = useState('')
    const [frequency, setFrequency] = useState('')
    const [description, setDescription] = useState('')

    // パネルが開かれるとフォームの値を初期化
    useEffect(() => {
        if (task) {
            setTitle(task.title ?? '')
            setCategory(task.category ?? '')
            setDueDate(task.next_due_date ?? '')
            setFrequency(task.frequency_days ?? '')
            setDescription(task.description ?? '')
        }
    }, [task])

    if (!task) return null

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
    <FloatingPanel
      title="タスク編集"
      isOpen={isOpen}
      onClose={onClose}
      initialTop="25%"
      initialLeft="35%"
    >
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
      <div className='form-group'>
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
      <button className="btn" onClick={handleSubmit}>
        変更を保存
      </button>
    </FloatingPanel>
  )
}

export default TaskEditPanel