import { useState, useRef, useEffect } from 'react'
import { apiPost } from '../api/client'

// AIチャットのカスタムフック

function useAiChat({ onRegisterTask }) {
    const [chatMessages, setChatMessages] = useState([
        { id: 0, role: 'ai', text: 'アシスタントAIです。'},
    ])
    const [chatInput, setChatInput] = useState('')
    const [isAiLoading, setIsAiLoading] = useState(false)
    const [showSeasonForm, setShowSeasonForm] = useState(false)
    const [season, setSeason] = useState('夏')
    const [livingEnvironment, setLivingEnvironment] = useState('一人暮らし')

    const chatAreaRef = useRef(null)
    const chatMessageIdRef = useRef(1)

    useEffect(() => {
        if (chatAreaRef.current) {
            chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight
        }
    }, [chatMessages])

    function addChatMessage(role, text, subtasks = null) {
        const id = chatMessageIdRef.current++
        setChatMessages((prev) => [...prev, { id, role, text, subtasks }])
    }

    async function handleSendChat() {
        const text = chatInput.trim()
        if (!text || isAiLoading) return

        addChatMessage('user', text)
        setChatInput('')
        setIsAiLoading(true)

        try {
            const result = await apiPost('/api/ai/breakdown', { task_name: text })
            addChatMessage('ai', `「${text}」の細分化`, result.subtasks)
        } catch (err) {
            addChatMessage('ai', `すみません。うまく処理できませんでした(${err.message})`)
        } finally {
            setIsAiLoading(false)
        }
    }

    async function handleProposeTasks() {
        setShowSeasonForm(false)
        addChatMessage('user', `季節「${season}」・住環境「${livingEnvironment}」でおすすめの家事を教えて`)
        setIsAiLoading(true)

        try {
            const result = await apiPost('/api/ai/propose', {
                season,
                living_environment: livingEnvironment,
            })
            const subtasks = result.proposed_tasks.map((t) => ({
                title: t.title,
                frequency_days: t.frequency_days,
                description: t.description,
            }))
            addChatMessage('ai', `この季節・住環境ですと、こんな家事がおすすめです`, subtasks)
        } catch (err) {
            addChatMessage('ai', `すみません、うまく処理できませんでした(${err.message})`)
        } finally {
            setIsAiLoading(false)
        }
    }

    function handleChatKeyPress(e) {
        if (e.key === 'Enter') handleSendChat()
    }

    function clearChat() {
        setChatMessages([{ id: 0, role: 'ai', text: '新しいチャットを開始しました。'}])
        chatMessageIdRef.current = 1
    }

    function openTaskRegisterFromSubtask(subtask) {
        onRegisterTask({ title: subtask.title, frequency_days: subtask.frequency_days })
    }

    return {
        chatMessages,
        chatInput,
        setChatInput,
        isAiLoading,
        showSeasonForm,
        setShowSeasonForm,
        season,
        setSeason,
        livingEnvironment,
        setLivingEnvironment,
        chatAreaRef,
        handleSendChat,
        handleProposeTasks,
        handleChatKeyPress,
        clearChat,
        openTaskRegisterFromSubtask,
    }
}

export default useAiChat