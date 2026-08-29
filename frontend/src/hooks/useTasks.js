import { useState } from 'react'
import { apiGet, apiPost, apiPut, apiDelete } from '../api/client'

function useTaks({ showToast, showConfirm }) {
    const [tasks, setTasks] = useState([])
    const [categoryFilter, setCategoryFilter] = useState('')

    async function loadTasks() {
        const data = await apiGet('/api/tasks')
        setTasks(data.tasks)
    }

    const taskCategoryOptions = [
        ...new Set(tasks.map((task) => task.category).filter(Boolean)),
    ]

    const filteredTasks = categoryFilter
        ? tasks.filter((task) => task.category === categoryFilter)
        : tasks
    
    // 次回予定日が近いものを上に表示する
    const sortedTasks = [...filteredTasks].sort((a, b) => {
        if (!a.next_due_date) return -1
        if (!b.next_due_date) return 1
        return new Date(a.next_due_date) - new Date(b.next_due_date)
    })


    // 新しいタスクを登録する
    async function handleCreateTask(taskInput, onDone) {
        try {
            await apiPost('/api/tasks', taskInput)
            showToast('新しいタスクを登録しました')
            onDone?.()
            await loadTasks()
        } catch (err) {
            showToast(err.message)
        }
    }

    // タスクを削除する
    async function handleDeleteTask(taskId, onDone) {
        const confirmed = await showConfirm('本当にこのタスクを削除しますか?')
        if (!confirmed) return

        try {
            await apiDelete(`/api/tasks/${taskId}`)
            showToast('タスクを削除しました')
            onDone?.()
            await loadTasks()
        } catch (err) {
            showToast(err.message)
        }
    }

    // タスク内容を編集する
    async function handleUpdateTask(taskId, taskInput, onDone) {
        try {
            await apiPut(`/api/tasks/${taskId}`, taskInput)
            showToast('タスクの内容を保存しました')
            onDone?.()
            await loadTasks()
        } catch (err) {
            showToast(err.message)
        }
    }

    // タスクを完了する
    async function handleCompleteTask(taskId) {
        try {
            await apiPost(`/api/tasks/${taskId}/complete`)
            showToast('タスクを完了として記録しました')
            await loadTasks()
        } catch (err) {
            showToast(err.message)
        }
    }

    return {
        tasks,
        sortedTasks,
        taskCategoryOptions,
        categoryFilter,
        setCategoryFilter,
        loadTasks,
        handleCreateTask,
        handleDeleteTask,
        handleUpdateTask,
        handleCompleteTask,
    }
}

export default useTaks