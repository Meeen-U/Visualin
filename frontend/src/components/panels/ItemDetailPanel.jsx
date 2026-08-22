import { useState } from 'react'
import FloatingPanel from '../FloatingPanel'
import { apiPost } from '../../api/client'

function ItemDetailPanel({ isOpen, onClose, item, onEdit, onDelete, onConsume, onRestock}) {
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
            <h3 style={{ marginTop: 0, marginBottom: '10px', color: '#2B221A' }}>
                {item.name}
            </h3>
            {item.is_alert ? (
                <span
                    className="tag"
                    style={{ backgroundColor: '#FAF5F2', color: '#9E4A34', border: '1px solid #9E4A34'}}
                >
                    ストック減少
                </span>
            ) : null}
            <p style={{ margin: '0 0 8px 0', fontSize: '0.95em' }}>
                <strong>現在の残量:</strong> {item.current_stock}
            </p>
            <p style={{ margin: '0 0 8px 0', fontSize: '0.95em' }}>
                <strong>アラーム目安:</strong> {item.alert_threshold} 以下
            </p>
            {item.purchase_cycle ? (
                <p style={{ margin: '0 0 8px 0', fontSize: '0.95em' }}>
                    <strong>購入サイクル:</strong> {item.purchase_cycle} 日ごと
                </p>
            ) : null}

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button
                    className="btn btn-secondary"
                    style={{ margin: 0, flex: 1 }}
                    onClick={() => onConsume(item.item_id)}
                >
                    ➖ 1つ使う
                </button>
                <button
                    className="btn"
                    style={{ margin: 0, flex: 1, backgroundColor: '#6E5447', borderColor: '#40342B' }}
                    onClick={() => onRestock(item.item_id)}
                >
                    🛒 購入完了
                </button>
            </div>

            < div style={{ marginTop: '20px' }}>
                <button
                    className="btn btn-secondary"
                    style={{ margin: 0, width: '100%' }}
                    onClick={handlePredict}
                    disabled={isPredicting}
                >
                    {isPredicting ? '予測中...' : '購入時期をAIに予測してもらう'}
                </button>
                {advice ? (
                    <p
                        style={{
                            marginTop: '10px',
                            fontSize: '0.9em',
                            color: '#403428',
                            background: '#FAF5F2',
                            padding: '10px',
                            border: '1px solid #D6CDC4'
                        }}
                    >
                        {advice}
                    </p>
                ) : null}
                {predictError ? (
                    <p style={{ marginTop: '10px', fontSize: '0.85em', color: '#9E4A34' }}>
                        {predictError}
                    </p>
                ) : null}
            </div>


            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button className="btn btn-secondary" style={{ margin: 0, flex: 1 }} onClick={onEdit}>
                    情報を編集
                </button>
                <button
                    className="btn btn-secondary btn-alert"
                    style={{ margin: 0, flex: 1 }}
                    onClick={() => onDelete(item.item_id)}
                >
                    削除
                </button>
            </div>            
        </FloatingPanel>
    )
}

export default ItemDetailPanel