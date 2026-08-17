import { useState, useEffect } from 'react'
import FloatingPanel from '../FloatingPanel'

function ItemEditPanel({ isOpen, onClose, item, onSubmit, categoryOptions = [] }) {
  const [name, setName] = useState('')
  const [currentStock, setCurrentStock] = useState(0)
  const [alertThreshold, setAlertThreshold] = useState(0)
  const [purchaseCycle, setPurchaseCycle] = useState('')
  const [category, setCategory] = useState('')

  useEffect(() => {
    if (item) {
      setName(item.name ?? '')
      setCurrentStock(item.current_stock ?? 0)
      setAlertThreshold(item.alert_threshold ?? 0)
      setPurchaseCycle(item.purchase_cycle ?? '')
      setCategory(item.category ?? '')
    }
  }, [item])

  if (!item) return null

  function handleSubmit() {
    onSubmit(item.item_id, {
      name,
      current_stock: Number(currentStock),
      alert_threshold: Number(alertThreshold),
      purchase_cycle: purchaseCycle ? Number(purchaseCycle) : null,
      category,
    })
  }

  return (
    <FloatingPanel
      title="消耗品情報の変更"
      isOpen={isOpen}
      onClose={onClose}
      initialTop="25%"
      initialLeft="40%"
    >
      <div className="form-group">
        <label>消耗品の名前</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="form-group">
        <label>現在の残量</label>
        <input
          type="number"
          value={currentStock}
          onChange={(e) => setCurrentStock(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>アラート基準値</label>
        <input
          type="number"
          value={alertThreshold}
          onChange={(e) => setAlertThreshold(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>購入サイクル (日)</label>
        <input
          type="number"
          value={purchaseCycle}
          onChange={(e) => setPurchaseCycle(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>カテゴリ</label>
        <input
          type="text"
          list="item-category-options"
          placeholder="例：キッチン"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <datalist id="item-category-option">
          {categoryOptions.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </div>
      <button className="btn" onClick={handleSubmit}>
        変更を保存
      </button>
    </FloatingPanel>
  )
}

export default ItemEditPanel