function ListPager({ page, pageSize, total, onPageChange }) {
    const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1)
    const hasPrev = page > 1
    const hasNext = page < totalPages
    const start = total === 0 ? 0 : (page - 1) * pageSize + 1
    const end = Math.min(page * pageSize, total)

    return (
        <div className="list-pager">
            <span className="list-pager-meta">
                {total}件中 {start === 0 ? 0 : `${start}–${end}`}件
            </span>
            <div className="list-pager-actions">
                <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ padding: '4px 10px', fontSize: '0.8em', margin: 0 }}
                    disabled={!hasPrev}
                    onClick={() => onPageChange(page - 1)}
                >
                    前へ
                </button>
                <span className="list-pager-page">
                    {page} / {totalPages}
                </span>
                <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ padding: '4px 10px', fontSize: '0.8em', margin: 0 }}
                    disabled={!hasNext}
                    onClick={() => onPageChange(page + 1)}
                >
                    次へ
                </button>
            </div>
        </div>
    )
}

export default ListPager
