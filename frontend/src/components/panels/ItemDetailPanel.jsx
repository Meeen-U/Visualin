import { useState } from 'react'
import FloatingPanel from '../FloatingPanel'
import { apiPost } from '../../api/client'

function ItemDetailPanel({ isOpen, onClose, item, onEdit, onDelete, onConsume, onRestock }) {
    const [advice, setAdvice] = useState('')
    const [isPredicting, setIsPredicting] = useState(false)
    const [predictError, setPredictError] = useState('')

    if (!item) return null

    async function handlePredict() {
        setIsPredicting(true)
        setPredictError('')
        setAdvice('')
        try {
            const result = await apiPost('/api/ai/predict', { item_id: item.item_id })
            setAdvice(result.advice)
        } catch (err) {
            setPredictError(err.message)
        } finally {
            setIsPredicting(false)
        }
    }

    return (
        <FloatingPanel
            title="消耗品詳細"
            isOpen={isOpen}
            onClose={onClose}
            initialTop="20%"
            initialLeft="45%"
        >
            <h3 className="panel-item-title">{item.name}</h3>
            <div className="card-tags">
                {item.is_alert ? <span className="tag tag-alert">ストック減少</span> : null}
                {item.category ? <span className="tag">{item.category}</span> : null}
            </div>
            <p className="panel-detail-row">
                <strong>現在の残量:</strong> {item.current_stock}
            </p>
            <p className="panel-detail-row">
                <strong>アラート目安:</strong> {item.alert_threshold} 以下
            </p>
            {item.purchase_cycle ? (
                <p className="panel-detail-row">
                    <strong>購入サイクル:</strong> {item.purchase_cycle} 日ごと
                </p>
            ) : null}

            <div className="panel-actions">
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
                    🛒 購入完了
                </button>
            </div>

            <div style={{ marginTop: '14px' }}>
                <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handlePredict}
                    disabled={isPredicting}
                >
                    {isPredicting ? '予測中...' : '購入時期をAIに予測してもらう'}
                </button>
                {advice ? <p className="ai-advice-box">{advice}</p> : null}
                {predictError ? (
                    <p className="text-alert" style={{ marginTop: '10px', fontSize: '0.88rem' }}>
                        {predictError}
                    </p>
                ) : null}
            </div>

            <div className="panel-actions">
                <button type="button" className="btn btn-secondary" onClick={onEdit}>
                    情報を編集
                </button>
                <button
                    type="button"
                    className="btn btn-secondary btn-alert"
                    onClick={() => onDelete(item.item_id)}
                >
                    削除
                </button>
            </div>
        </FloatingPanel>
    )
}

export default ItemDetailPanel
