import FloatingPanel from "../FloatingPanel"

function TaskDetailPanel({ isOpen, onClose, task, onEdit, onDelete}) {
    if (!task) return null

    return (
        <FloatingPanel
            title="タスク詳細"
            isOpen={isOpen}
            onClose={onClose}
            initialTop="20%"
            initialLeft="30%"
        >
            <h3 style={{ marginTop: 0, marginBottom: '10px', color: '#2B221A' }}>
                {task.title}
            </h3>
            {task.category ? <span className="tag">{task.category}</span> : null}
            <p style={{margin: '0 0 8px 0', fontSize: '0.95em' }}>
                <strong>次回予定日:</strong> {task.next_due_date ?? '未設定'}
            </p>
            <p style={{margin: '0 0 8px 0', fontSize: '0.95em' }}>
                <strong>繰り返し:</strong> {task.frequency_days}日おき
            </p>
            {task.description ? (
                <p style={{margin: '0 0 20px 0', fontSize: '0.95em', color: '#6E6055', lineHeight: '1.6'}}>
                    {task.description}
                </p>
            ) : null}
            <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn btn-secondary" style={{ margin: 0 }} onClick={onEdit}>
                    情報を編集
                </button>
                <button
                    className="btn btn-secondary btn-alert"
                    style={{ margin: 0 }}
                    onClick={() => onDelete(task.task_id)}
                >
                    削除
                </button>
            </div>
        </FloatingPanel>
    )
}

export default TaskDetailPanel