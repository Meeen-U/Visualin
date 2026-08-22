import { useState, useEffect } from 'react'
import FloatingPanel from '../FloatingPanel'

function TaskRegisterPanel({ isOpen, onClose, onSubmit, categoryOptions = [], initialValues}) {
    const [title, setTitle] = useState('')
    const [category, setCategory] = useState('')
    const [dueDate, setDueDate] = useState('')
    const [frequency, setFrequency] = useState('')
    const [description, setDescription] = useState('')

    // AIチャットから開かれた時
    useEffect(() => {
        if (isOpen && initialValues) {
            setTitle(initialValues.title ?? '')
            setFrequency(initialValues.frequency_days ?? '')
            setDescription(initialValues.description ?? '')
        }
    }, [isOpen, initialValues])

    function resetForm() {
        setTitle('')
        setCategory('')
        setDueDate('')
        setFrequency('')
        setDescription('')
    }

    function handleSubmit() {
        onSubmit({
            title,
            category,
            next_due_date: dueDate || null,
            frequency_days: Number(frequency),
            description: description || null,
        })
        resetForm()
    }

    return (
        <FloatingPanel
            title="タスク新規登録"
            isOpen={isOpen}
            onClose={onClose}
            initialTop="15%"
            initialLeft="10%"
        >
            <div className="form-group">
                <label>家事の名前</label>
                <input
                    type="text"
                    placeholder="例：ゴミ出し"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
            </div>
            <div className="form-group">
                <label>カテゴリ</label>
                <input
                    type="text"
                    list="task-category-options"
                    placeholder="例：水回り"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                />
                <datalist id="task-category-options">
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
                <label>繰り返し間隔（日）</label>
                <input
                    type="number"
                    placeholder="7"
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                />
            </div>
            <button className="btn" onClick={handleSubmit}>
                登録を確定
            </button>
        </FloatingPanel>
    )
}

export default TaskRegisterPanel