import ListPager from './ListPager'

function ItemColumn({
    items,
    itemCategoryOptions,
    categoryFilter,
    onCategoryFilterChange,
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
    return (
        <div className="dashboard-col">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h2 className="col-title title-item">
                    消耗品一覧 <span className="badge">{alertCount}</span>
                </h2>
                <select
                    value={categoryFilter}
                    onChange={(e) => onCategoryFilterChange(e.target.value)}
                    style={{ width: 'auto', fontSize: '0.85em', padding: '4px 8px' }}
                >
                <option value="">すべて</option>
                {itemCategoryOptions.map((c) => (
                    <option key={c} value={c}>
                        {c}
                    </option>
                ))}
                </select>
            </div>

            {items.length === 0 ? (
                 <p style={{ color: '#6E6055', fontSize: '0.9em' }}>
                    {total === 0 && !categoryFilter ? 'まだ消耗品が登録されていません' : 'このカテゴリの消耗品はありません'}
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