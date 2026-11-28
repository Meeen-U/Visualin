import { useState, useCallback, useRef } from 'react'
import { ToastContext } from './useToast'

/**
 * アプリ全体をこのProviderで囲むことで、
 * どのページからでも showToast('メッセージ') を呼び出せるようになる
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const nextId = useRef(0)

  const showToast = useCallback((message) => {
    const id = nextId.current++
    setToasts((prev) => [...prev, { id, message }])

    // 3秒後に自動で消す（プロトタイプのタイマーと同じ挙動）
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
  }, [])

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div id="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className="toast-msg">
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}