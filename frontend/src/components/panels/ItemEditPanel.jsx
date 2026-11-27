import { useState } from 'react'
import FloatingPanel from '../FloatingPanel'

function ItemEditForm({ onClose, item, onSubmit, categoryOptions }) {
  const [name, setName] = useState(item.name ?? '')
  const [currentStock, setCurrentStock] = useState(item.current_stock ?? 0)
  const [alertThreshold, setAlertThreshold] = useState(item.alert_threshold ?? 0)
  const [purchaseCycle, setPurchaseCycle] = useState(item.purchase_cycle ?? '')
  const [category, setCategory] = useState(item.category ?? '')

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
      isOpen
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
        <datalist id="item-category-options">
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

function ItemEditPanel({ isOpen, onClose, item, onSubmit, categoryOptions = [] }) {
  if (!isOpen || !item) return null

  return (
    <ItemEditForm
      key={item.item_id}
      onClose={onClose}
      item={item}
      onSubmit={onSubmit}
      categoryOptions={categoryOptions}
    />
  )
}

export default ItemEditPanel