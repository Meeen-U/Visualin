import { useState } from 'react'
import FloatingPanel from '../FloatingPanel'

function ItemEditForm({ item, onSubmit, categoryOptions }) {
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
    <>
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
          list="item-category-options-edit"
          placeholder="例：キッチン"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <datalist id="item-category-options-edit">
          {categoryOptions.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </div>
      <button type="button" className="btn" onClick={handleSubmit}>
        変更を保存
      </button>
    </>
  )
}

function ItemEditPanel({ isOpen, onClose, item, onSubmit, categoryOptions = [] }) {
  if (!item) return null

  return (
    <FloatingPanel
      title="消耗品情報の変更"
      isOpen={isOpen}
      onClose={onClose}
      initialTop="25%"
      initialLeft="40%"
    >
      <ItemEditForm
        key={item.item_id}
        item={item}
        onSubmit={onSubmit}
        categoryOptions={categoryOptions}
      />
    </FloatingPanel>
  )
}

export default ItemEditPanel
