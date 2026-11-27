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
    const emptyMessage = !hasFilter && total === 0
        ? 'まだ消耗品が登録されていません'
        : alertOnly && !categoryFilter
            ? '在庫アラートの消耗品はありません'
            : '条件に一致する消耗品はありません'

    return (
        <div className="dashboard-col">
            <div className="col-header">
                <h2 className="col-title title-item">
                    消耗品一覧 <span className="badge">{alertCount}</span>
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

            {items.length === 0 ? (
                 <p style={{ color: '#6E6055', fontSize: '0.9em' }}>
                    {emptyMessage}
                 </p>
            ) : null}

            {items.map((item) => (
                <div className={item.is_alert ? 'card-item-alert' : 'card-task'} key={item.item_id}>
                    <div className="card-title">{item.name}</div>
                    <div className={item.is_alert ? 'card-meta text-alert' : 'card-meta'}>
                        {item.is_alert ? '残量目安を下回っています' : `残量: ${item.current_stock}`}
                    </div>
                    <div className="flex-between" style={{ marginTop: '20px', gap: '8px' }}>
                        <button
                            className="btn btn-secondary"
                            style={{ padding: '6px 12px', fontSize: '0.85em', margin: 0 }}
                            onClick={() => onOpenDetail(item)}
                        >
                            詳細・変更
                        </button>
                        <button
                            className="btn btn-secondary"
                            style={{ padding: '6px 10px', fontSize: '0.85em', margin: 0 }}
                            onClick={() => onConsume(item.item_id)}
                        >
                            ➖ 1つ使う
                        </button>
                        <button
                            className="btn"
                            style={{
                                backgroundColor: '#6E5447',
                                padding: '6px 12px',
                                fontSize: '0.85em',
                                borderColor: '#40342B',
                                margin: 0,
                            }}
                            onClick={() => onRestock(item.item_id)}
                        >
                            購入完了
                        </button>
                    </div>
                </div>
            ))}

            <ListPager page={page} pageSize={pageSize} total={total} onPageChange={onPageChange} />

            <button className="btn btn-secondary" style={{ marginTop: '20px' }} onClick={onOpenRegister}>
                消耗品を新規登録
            </button>
        </div>
  )
}

export default ItemColumn