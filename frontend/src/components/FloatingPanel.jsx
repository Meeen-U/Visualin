import { useEffect, useRef, useState } from 'react'

let globalPanelZIndex = 1000

function parseCoord(value, viewportSize) {
    if (typeof value === 'number') return value
    if (typeof value === 'string' && value.endsWith('%')) {
        return (parseFloat(value) / 100) * viewportSize
    }
    const parsed = parseFloat(value)
    return Number.isNaN(parsed) ? 48 : parsed
}

function clampPosition(left, top, panelWidth, panelHeight) {
    const margin = 16
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1024
    const vh = typeof window !== 'undefined' ? window.innerHeight : 768
    const maxLeft = Math.max(margin, vw - panelWidth - margin)
    const maxTop = Math.max(margin, vh - panelHeight - margin)
    return {
        left: Math.min(Math.max(margin, left), maxLeft),
        top: Math.min(Math.max(margin, top), maxTop),
    }
}

function getInitialClampedPosition(initialTop, initialLeft) {
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1024
    const vh = typeof window !== 'undefined' ? window.innerHeight : 768
    const estimatedWidth = Math.min(370, vw - 32)
    const estimatedHeight = Math.min(420, vh - 64)
    const rawLeft = parseCoord(initialLeft, vw)
    const rawTop = parseCoord(initialTop, vh)
    return clampPosition(rawLeft, rawTop, estimatedWidth, estimatedHeight)
}

function FloatingPanelContent({ title, onClose, initialTop, initialLeft, children }) {
    const panelRef = useRef(null)
    const [position, setPosition] = useState(() =>
        getInitialClampedPosition(initialTop, initialLeft)
    )
    const [zIndex, setZIndex] = useState(() => ++globalPanelZIndex)
    const dragState = useRef({ dragging: false, startX: 0, startY: 0 })

    const cleanupDragRef = useRef(null)

    useEffect(() => {
        function handleResize() {
            if (!panelRef.current) return
            const rect = panelRef.current.getBoundingClientRect()
            setPosition((prev) => clampPosition(prev.left, prev.top, rect.width, rect.height))
        }
        window.addEventListener('resize', handleResize)
        return () => {
            window.removeEventListener('resize', handleResize)
            cleanupDragRef.current?.()
        }
    }, [])

    function bringToFront() {
        setZIndex(++globalPanelZIndex)
    }

    function handleMouseDown(e) {
        bringToFront()
        dragState.current = {
            dragging: true,
            startX: e.clientX,
            startY: e.clientY,
        }

        function onMouseMove(moveEvent) {
            if (!dragState.current.dragging || !panelRef.current) return

            const deltaX = moveEvent.clientX - dragState.current.startX
            const deltaY = moveEvent.clientY - dragState.current.startY

            const rect = panelRef.current.getBoundingClientRect()
            const next = clampPosition(rect.left + deltaX, rect.top + deltaY, rect.width, rect.height)

            setPosition(next)

            dragState.current.startX = moveEvent.clientX
            dragState.current.startY = moveEvent.clientY
        }

        function onMouseUp() {
            dragState.current.dragging = false
            document.removeEventListener('mousemove', onMouseMove)
            document.removeEventListener('mouseup', onMouseUp)
            cleanupDragRef.current = null
        }

        cleanupDragRef.current = onMouseUp
        document.addEventListener('mousemove', onMouseMove)
        document.addEventListener('mouseup', onMouseUp)
    }
    return (
        <div
            ref={panelRef}
            className="floating-panel"
            style={{
                display: 'block',
                top: `${position.top}px`,
                left: `${position.left}px`,
                zIndex,
            }}
            onMouseDown={bringToFront}
        >
            <div className="panel-header" onMouseDown={handleMouseDown}>
                <span>{title}</span>
                <button
                    type="button"
                    className="panel-close"
                    aria-label="閉じる"
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={onClose}
                >
                    ×
                </button>
            </div>
            <div className="panel-content">{children}</div>
        </div>
    )
}

function FloatingPanel({
    title,
    isOpen,
    onClose,
    initialTop = '20%',
    initialLeft = '30%',
    children,
}) {
    if (!isOpen) return null

    return (
        <FloatingPanelContent
            title={title}
            onClose={onClose}
            initialTop={initialTop}
            initialLeft={initialLeft}
        >
            {children}
        </FloatingPanelContent>
    )
}

export default FloatingPanel
