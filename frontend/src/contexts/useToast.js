import { createContext, useContext } from 'react'

export const ToastContext = createContext(null)

/**
 * 各ページのコンポーネントでこのフックを呼ぶと、
 * showToast('メッセージ') が使えるようになる
 */
export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToastはToastProviderの内側で使ってください')
  }
  return context
}
