import ListPager from './ListPager'

function TaskColumn({
    tasks,
    taskCategoryOptions,
    categoryFilter,
    onCategoryFilterChange,
    page,
    pageSize,
    total,
    onPageChange,
    onOpenDetail,
    onComplete,
    onOpenRegister,
}) {
    return (

    <div className="dashboard-col">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h2 className="col-title title-task">今日の家事タスク</h2>
            <select
                value={categoryFilter}
                onChange={(e) => onCategoryFilterChange(e.target.value)}
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

        {tasks.length === 0 ? (
            <p style={{ color: '#6E6055', fontSize: '0.9em' }}>
            {total === 0 && !categoryFilter ? 'まだタスクが登録されていません' : 'このカテゴリのタスクはありません'}
            </p>
        ) : null}

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
                        onClick={() => onOpenDetail(task)}
                    >
                        詳細を見る
                    </button>
                    <button
                        className="btn"
                        style={{ padding: '6px 15px', fontSize: '0.85em' }}
                        onClick={() => onComplete(task.task_id)}
                    >
                        完了する
                    </button>
                </div>
            </div>
        ))}

        <ListPager page={page} pageSize={pageSize} total={total} onPageChange={onPageChange} />

        <button className="btn btn-secondary" style={{ marginTop: '20px' }} onClick={onOpenRegister}>
            タスクを新規登録
        </button>
    </div>
    )
}

export default TaskColumn