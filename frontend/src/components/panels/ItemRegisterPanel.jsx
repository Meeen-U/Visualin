import { useState } from 'react'
import FloatingPanel from '../FloatingPanel'

function ItemRegisterPanel({ isOpen, onClose, onSubmit}) {
    const [name, setName] = useState('')
    const [currentStock, setCurrentStock] = useState(1)
    const [alertThreshold, setAlertThreshold] = useState(1)
    const [purchaseCycle, setPurchaseCycle] = useState('')
    const [category, setCategory] = useState('未分類')

    function resetForm() {
        setName('')
        setAlertThreshold(1)
        setPurchaseCycle('')
        setCategory('未分類')
    }

    function handleSubmit() {
        onSubmit({
            name,
            current_stock: Number(currentStock),
            alert_threshold: Number(alertThreshold),
            purchase_cycle: purchaseCycle ? Number(purchaseCycle) : null,
            category,
        })
        resetForm()   
    }

    return (
    <FloatingPanel
      title="消耗品新規登録"
      isOpen={isOpen}
      onClose={onClose}
      initialTop="15%"
      initialLeft="50%"
    >
      <div className="form-group">
        <label>消耗品の名前</label>
        <input
          type="text"
          placeholder="例：食器用洗剤"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>現在の残量 (個/本)</label>
        <input
          type="number"
          value={currentStock}
          onChange={(e) => setCurrentStock(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>アラートの残量目安</label>
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
          placeholder="30"
          value={purchaseCycle}
          onChange={(e) => setPurchaseCycle(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>カテゴリ</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option>未分類</option>
          <option>キッチン</option>
          <option>お風呂</option>
          <option>トイレ</option>
        </select>
      </div>
      <button className="btn" onClick={handleSubmit}>
        登録を確定
      </button>
    </FloatingPanel>
  )
}

export default ItemRegisterPanel