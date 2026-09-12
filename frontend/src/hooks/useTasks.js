import { useState } from 'react'
import { apiGet, apiPost, apiPut, apiDelete } from '../api/client'

export const TASK_PAGE_SIZE = 20

function useTaks({ showToast, showConfirm }) {
    const [tasks, setTasks] = useState([])
    const [categoryFilter, setCategoryFilter] = useState('')
    const [page, setPage] = useState(1)
    const [total, setTotal] = useState(0)
    const [taskCategoryOptions, setTaskCategoryOptions] = useState([])

    async function loadTasks({ nextPage = page, nextCategory = categoryFilter } = {}) {
        const params = new URLSearchParams({
            page: String(nextPage),
            page_size: String(TASK_PAGE_SIZE),
        })
        if (nextCategory) {
            params.set('category', nextCategory)
        }

        const data = await apiGet(`/api/tasks?${params.toString()}`)

        if (data.tasks.length === 0 && data.page > 1 && data.total > 0) {
            return loadTasks({ nextPage: data.page - 1, nextCategory })
        }

        setTasks(data.tasks)
        setTotal(data.total)
        setPage(data.page)
        setTaskCategoryOptions(data.categories || [])
    }

    async function handleCategoryFilterChange(value) {
        setCategoryFilter(value)
        try {
            await loadTasks({ nextPage: 1, nextCategory: value })
        } catch (err) {
            showToast(err.message)
        }
    }

    async function handlePageChange(nextPage) {
        try {
            await loadTasks({ nextPage })
        } catch (err) {
            showToast(err.message)
        }
    }

    // 新しいタスクを登録する
    async function handleCreateTask(taskInput, onDone) {
        try {
            await apiPost('/api/tasks', taskInput)
            showToast('新しいタスクを登録しました')
            onDone?.()
            await loadTasks({ nextPage: 1 })
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
        taskCategoryOptions,
        categoryFilter,
        page,
        pageSize: TASK_PAGE_SIZE,
        total,
        loadTasks,
        handleCategoryFilterChange,
        handlePageChange,
        handleCreateTask,
        handleDeleteTask,
        handleUpdateTask,
        handleCompleteTask,
    }
}

export default useTaks