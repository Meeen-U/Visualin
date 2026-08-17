import { useState, useEffect } from 'react'
import FloatingPanel from '../FloatingPanel'

function TaskEditPanel({ isOpen, onClose, task, onSubmit }) {
    const [title, setTitle] = useState('')
    const [category, setCategory] = useState('水回り')
    const [dueDate, setDueDate] = useState('')
    const [frequency, setFrequency] = useState('')

    // パネルが開かれるとフォームの値を初期化
    useEffect(() => {
        if (task) {
            setTitle(task.title ?? '')
            setCategory(task.category ?? '水回り')
            setDueDate(task.next_due_date ?? '')
            setFrequency(task.frequency_days ?? '')
        }
    }, [task])

    if (!task) return null

    function handleSubmit() {
        onSubmit(task.task_id, {
            title,
            category,
            next_due_date: dueDate || null,
            frequency_days: Number(frequency),
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
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option>水回り</option>
          <option>キッチン</option>
        </select>
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