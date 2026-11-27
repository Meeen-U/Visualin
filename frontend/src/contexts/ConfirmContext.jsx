import { createContext, useContext, useState, useCallback, useRef } from 'react'

const ConfirmContext = createContext(null)

export function ConfirmProvider({ children }) {
  const [message, setMessage] = useState(null)
  const resolveRef = useRef(null)

  const showConfirm = useCallback((msg) => {
    setMessage(msg)
    return new Promise((resolve) => {
      resolveRef.current = resolve
    })
  }, [])

  function handleAnswer(result) {
    setMessage(null)
    if (resolveRef.current) {
      resolveRef.current(result)
      resolveRef.current = null
    }
  }

  return (
    <ConfirmContext.Provider value={showConfirm}>
      {children}
      {message ? (
        <div className="confirm-overlay">
          <div className="confirm-dialog" role="dialog" aria-modal="true">
            <p className="confirm-message">{message}</p>
            <div className="panel-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => handleAnswer(false)}
              >
                いいえ
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-alert"
                onClick={() => handleAnswer(true)}
              >
                はい
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </ConfirmContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useConfirm() {
  const context = useContext(ConfirmContext)
  if (!context) {
    throw new Error('useConfirmはConfirmProviderの内側で使ってください')
  }
  return context
}
