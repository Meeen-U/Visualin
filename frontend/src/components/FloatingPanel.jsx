import { useRef, useState } from 'react'

let nextZIndex = 1000
function getNextZIndex() {
    nextZIndex += 1
    return nextZIndex
}

function FloatingPanelContent({
    title,
    onClose,
    initialTop,
    initialLeft,
    children,
}) {
    const panelRef = useRef(null)
    const [position, setPosition] = useState({ top: initialTop, left: initialLeft })
    const [zIndex, setZIndex] = useState(getNextZIndex)
    const dragState = useRef({ dragging: false, startX: 0, startY: 0 })

    function bringToFront() {
        setZIndex(getNextZIndex())
    }

    function handleMouseDown(e) {
        bringToFront()
        dragState.current = {
            dragging: true,
            startX: e.clientX,
            startY: e.clientY,
        }
        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)
    }

    function handleMouseMove(e) {
        if (!dragState.current.dragging || !panelRef.current) return

        const deltaX = e.clientX - dragState.current.startX
        const deltaY = e.clientY - dragState.current.startY

        const rect = panelRef.current.getBoundingClientRect()
        const newLeft = rect.left + deltaX
        const newTop = rect.top + deltaY

        setPosition({ top: `${newTop}px`, left: `${newLeft}px` })

        dragState.current.startX = e.clientX
        dragState.current.startY = e.clientY
    }

    function handleMouseUp() {
        dragState.current.dragging = false
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
    }

    return (
        <div
            ref={panelRef}
            className="floating-panel"
            style={{
                display: 'block',
                top: position.top,
                left: position.left,
                zIndex,
            }}
            onMouseDown={bringToFront}
        >
            <div className="panel-header" onMouseDown={handleMouseDown}>
                <span>{title}</span>
                <span className="panel-close" onClick={onClose}>*</span>
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