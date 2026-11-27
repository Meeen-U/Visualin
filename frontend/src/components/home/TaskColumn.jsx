import ListPager from './ListPager'

function TaskColumn({
    tasks,
    taskCategoryOptions,
    categoryFilter,
    onCategoryFilterChange,
    dueFilter,
    onDueFilterChange,
    page,
    pageSize,
    total,
    onPageChange,
    onOpenDetail,
    onComplete,
    onOpenRegister,
}) {
    const hasFilter = Boolean(categoryFilter || dueFilter)

    return (

    <div className="dashboard-col">
        <div className="col-header">
            <h2 className="col-title title-task">今日の家事タスク</h2>
            <div className="filter-bar">
                <select
                    aria-label="カテゴリで絞り込み"
                    className="filter-select"
                    value={categoryFilter}
                    onChange={(e) => onCategoryFilterChange(e.target.value)}
                >
                    <option value="">カテゴリ: すべて</option>
                    {taskCategoryOptions.map((c) => (
                        <option key={c} value={c}>
                            {c}
                        </option>
                    ))}
                </select>
                <select
                    aria-label="期限で絞り込み"
                    className="filter-select"
                    value={dueFilter}
                    onChange={(e) => onDueFilterChange(e.target.value)}
                >
                    <option value="">期限: すべて</option>
                    <option value="overdue">期限切れ</option>
                    <option value="0">今日まで</option>
                    <option value="3">3日以内</option>
                    <option value="7">7日以内</option>
                </select>
            </div>
        </div>

        {tasks.length === 0 ? (
            <p style={{ color: '#6E6055', fontSize: '0.9em' }}>
            {total === 0 && !hasFilter ? 'まだタスクが登録されていません' : '条件に一致するタスクはありません'}
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