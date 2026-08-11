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
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(43, 34, 26, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 5000,
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '2px solid #2B221A',
              padding: '28px',
              width: '320px',
              boxShadow: '10px 15px 35px rgba(43, 34, 26, 0.22)',
            }}
          >
            <p style={{ margin: '0 0 24px 0', color: '#2B221A', lineHeight: '1.6' }}>
              {message}
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="btn btn-secondary"
                style={{ margin: 0, flex: 1 }}
                onClick={() => handleAnswer(false)}
              >
                いいえ
              </button>
              <button
                className="btn btn-secondary btn-alert"
                style={{ margin: 0, flex: 1 }}
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

export function useConfirm() {
  const context = useContext(ConfirmContext)
  if (!context) {
    throw new Error('useConfirmはConfirmProviderの内側で使ってください')
  }
  return context
}