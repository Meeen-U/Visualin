import ListPager from './ListPager'

function ItemColumn({
    items,
    itemCategoryOptions,
    categoryFilter,
    onCategoryFilterChange,
    alertOnly,
    onAlertOnlyChange,
    alertCount,
    page,
    pageSize,
    total,
    onPageChange,
    onOpenDetail,
    onConsume,
    onRestock,
    onOpenRegister,
}) {
    const hasFilter = Boolean(categoryFilter || alertOnly)
    const emptyMessage =
        !hasFilter && total === 0
            ? 'まだ消耗品が登録されていません 📝'
            : alertOnly && !categoryFilter
                ? '他に不足しているものはありません 🎉'
                : '条件に一致する消耗品はありません'

    return (
        <section className="dashboard-col">
            <div className="col-header">
                <h2 className="col-title">
                    <span className="title-item">消耗品一覧</span>
                    <span className="badge">{alertCount}</span>
                </h2>
                <div className="filter-bar">
                    <select
                        aria-label="カテゴリで絞り込み"
                        className="filter-select"
                        value={categoryFilter}
                        onChange={(e) => onCategoryFilterChange(e.target.value)}
                    >
                        <option value="">カテゴリ: すべて</option>
                        {itemCategoryOptions.map((c) => (
                            <option key={c} value={c}>
                                {c}
                            </option>
                        ))}
                    </select>
                    <label className="filter-toggle">
                        <input
                            type="checkbox"
                            checked={alertOnly}
                            onChange={(e) => onAlertOnlyChange(e.target.checked)}
                        />
                        <span>アラートのみ</span>
                    </label>
                </div>
            </div>

            {items.length === 0 ? <div className="empty-state">{emptyMessage}</div> : null}

            {items.map((item) => (
                <div
                    className={item.is_alert ? 'card-item-alert' : 'card-task is-item'}
                    key={item.item_id}
                >
                    <div className="flex-between" style={{ marginBottom: '4px' }}>
                        <p className="card-title" style={{ margin: 0 }}>
                            {item.name}
                        </p>
                        {item.is_alert ? <span className="badge">要補充</span> : null}
                    </div>

                    {item.category ? (
                        <div className="card-tags">
                            <span className="tag">{item.category}</span>
                        </div>
                    ) : null}

                    <p className={item.is_alert ? 'card-meta text-alert' : 'card-meta'}>
                        {item.is_alert
                            ? `残り ${item.current_stock} ・ 残量目安を下回っています`
                            : `残量: ${item.current_stock}`}
                    </p>

                    <div className="card-actions">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => onOpenDetail(item)}
                        >
                            詳細・変更
                        </button>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => onConsume(item.item_id)}
                        >
                            ➖ 1つ使う
                        </button>
                        <button
                            type="button"
                            className="btn btn-accent"
                            onClick={() => onRestock(item.item_id)}
                        >
                            購入完了
                        </button>
                    </div>
                </div>
            ))}

            <ListPager page={page} pageSize={pageSize} total={total} onPageChange={onPageChange} />

            <button
                type="button"
                className="btn btn-secondary"
                style={{ marginTop: '18px' }}
                onClick={onOpenRegister}
            >
                ＋ 消耗品を新規登録
            </button>
        </section>
    )
}

export default ItemColumn
