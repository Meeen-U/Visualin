import ListPager from './ListPager'

function getTodayDateString() {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

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
    const todayStr = getTodayDateString()

    return (
        <section className="dashboard-col">
            <div className="col-header">
                <h2 className="col-title">
                    <span className="title-task">今日の家事タスク</span>
                </h2>
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
                <div className="empty-state">
                    {total === 0 && !hasFilter ? 'まだタスクが登録されていません 📝' : '条件に一致するタスクはありません'}
                </div>
            ) : null}

            {tasks.map((task) => {
                const isOverdue = Boolean(task.next_due_date && task.next_due_date < todayStr)
                const isToday = Boolean(task.next_due_date && task.next_due_date === todayStr)
                const cardClassName = [
                    'card-task',
                    isOverdue ? 'is-overdue' : isToday ? 'is-today' : '',
                ]
                    .filter(Boolean)
                    .join(' ')

                return (
                    <div className={cardClassName} key={task.task_id}>
                        <div className="flex-between" style={{ marginBottom: '4px' }}>
                            <p className="card-title" style={{ margin: 0 }}>
                                {task.title}
                            </p>
                            {isOverdue ? <span className="badge">期限切れ</span> : null}
                        </div>

                        {isToday || task.category ? (
                            <div className="card-tags">
                                {isToday ? <span className="tag">今日</span> : null}
                                {task.category ? <span className="tag">{task.category}</span> : null}
                            </div>
                        ) : null}

                        <p className="card-meta">
                            期限: {task.next_due_date ?? '未設定'} ・ {task.frequency_days}日おき
                        </p>

                        {task.description ? <p className="card-desc">{task.description}</p> : null}

                        <div className="card-actions">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => onOpenDetail(task)}
                            >
                                詳細を見る
                            </button>
                            <button
                                type="button"
                                className="btn"
                                onClick={() => onComplete(task.task_id)}
                            >
                                完了にする
                            </button>
                        </div>
                    </div>
                )
            })}

            <ListPager page={page} pageSize={pageSize} total={total} onPageChange={onPageChange} />

            <button
                type="button"
                className="btn btn-secondary"
                style={{ marginTop: '18px' }}
                onClick={onOpenRegister}
            >
                ＋ タスクを新規登録
            </button>
        </section>
    )
}

export default TaskColumn
