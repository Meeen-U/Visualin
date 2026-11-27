import FloatingPanel from '../FloatingPanel'

function TaskDetailPanel({ isOpen, onClose, task, onEdit, onDelete }) {
    if (!task) return null

    return (
        <FloatingPanel
            title="タスク詳細"
            isOpen={isOpen}
            onClose={onClose}
            initialTop="20%"
            initialLeft="30%"
        >
            <h3 className="panel-item-title">{task.title}</h3>
            {task.category ? <span className="tag">{task.category}</span> : null}
            <p className="panel-detail-row">
                <strong>次回予定日:</strong> {task.next_due_date ?? '未設定'}
            </p>
            <p className="panel-detail-row">
                <strong>繰り返し:</strong> {task.frequency_days}日おき
            </p>
            {task.description ? <p className="panel-detail-desc">{task.description}</p> : null}
            <div className="panel-actions">
                <button type="button" className="btn btn-secondary" onClick={onEdit}>
                    情報を編集
                </button>
                <button
                    type="button"
                    className="btn btn-secondary btn-alert"
                    onClick={() => onDelete(task.task_id)}
                >
                    削除
                </button>
            </div>
        </FloatingPanel>
    )
}

export default TaskDetailPanel
