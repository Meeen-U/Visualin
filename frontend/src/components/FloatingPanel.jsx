import { useRef, useState, useEffect } from 'react'

function FloatingPanel({
    title,
    isOpen,
    onClose,
    initialTop = '20%',
    initialLeft = '30%',
    children,
}) {
    const panelRef = useRef(null)
    const [position, setPosition] = useState({ top: initialTop, left: initialLeft })
    const [zIndex, setZIndex] = useState(1000)
    const dragState = useRef({ dragging: false, startX: 0, startY: 0 })

    // 開くたびに最前面表示
    useEffect(() => {
        if (isOpen) {
            setZIndex((z) => z + 1)
        }
    }, [isOpen])

    function bringToFront() {
        setZIndex((z) => z + 1)
    }

    function handleMouseDown(e) {
        bringToFront()
        dragState.current = {
            dragging: true,
            startX: e.clientX,
            startY: e.clientY,
        }
        document.addEventListener('mousemove',handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)
    }

    function handleMouseMove(e) {
        if (!dragState.current.dragging || !panelRef.current) return

        const deltaX = e.clientX - dragState.current.startX
        const deltaY = e.clientY - dragState.current.startY

        const rect = panelRef.current.getBoundingClientRect()
        const newLeft = rect.left + deltaX
        const newTop = rect.top + deltaY

        setPosition({ top: '${newTop}px', left: '${newLeft}px'})

        dragState.current.startX = e.clientX
        dragState.current.startY = e.clientY
    }

    function handleMouseUp() {
        dragState.current.dragging = false
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
    }

    if (!isOpen) return null

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

export default FloatingPanel