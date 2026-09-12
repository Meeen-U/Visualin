import { useState } from 'react'
import { apiGet, apiPost, apiPut, apiDelete } from '../api/client'

// 消耗品の一覧取得・CRUD・絞り込みをまとめたカスタムフック
export const ITEM_PAGE_SIZE = 20

function useItems({ showToast, showConfirm }) {
    const [items, setItems] = useState([])
    const [categoryFilter, setCategoryFilter] = useState('')
    const [page, setPage] = useState(1)
    const [total, setTotal] = useState(0)
    const [itemCategoryOptions, setItemCategoryOptions] = useState([])
    const [alertCount, setAlertCount] = useState(0)

    async function loadItems({ nextPage = page, nextCategory = categoryFilter } = {}) {
        const params = new URLSearchParams({
            page: String(nextPage),
            page_size: String(ITEM_PAGE_SIZE),
        })
        if (nextCategory) {
            params.set('category', nextCategory)
        }

        const data = await apiGet(`/api/items?${params.toString()}`)

        if (data.items.length === 0 && data.page > 1 && data.total > 0) {
            return loadItems({ nextPage: data.page - 1, nextCategory })
        }

        setItems(data.items)
        setTotal(data.total)
        setPage(data.page)
        setItemCategoryOptions(data.categories || [])
        setAlertCount(data.alert_count ?? 0)
    }

    async function handleCategoryFilterChange(value) {
        setCategoryFilter(value)
        try {
            await loadItems({ nextPage: 1, nextCategory: value })
        } catch (err) {
            showToast(err.message)
        }
    }

    async function handlePageChange(nextPage) {
        try {
            await loadItems({ nextPage })
        } catch (err) {
            showToast(err.message)
        }
    }

    async function handleCreateItem(itemInput, onDone) {
        try {
            await apiPost('/api/items', itemInput)
            showToast('消耗品を登録しました')
            onDone?.()
            await loadItems({ nextPage: 1 })
        } catch (err) {
            showToast(err.message)
        }
    }

    async function handleUpdateItem(itemId, itemInput, onDone) {
        try {
            await apiPut(`/api/items/${itemId}`, itemInput)
            showToast('消耗品情報を更新しました')
            onDone?.()
            await loadItems()
        } catch (err) {
            showToast(err.message)
        }
    }

    async function handleDeleteItem(itemId, onDone) {
        const confirmed = await showConfirm('本当にこの消耗品を削除しますか？')
        if (!confirmed) return

        try {
            await apiDelete(`/api/items/${itemId}`)
            showToast('消耗品を削除しました')
            onDone?.()
            await loadItems()
        } catch (err) {
            showToast(err.message)
        }
    }

    async function handleConsumeItem(itemId, onDone) {
        try {
            await apiPost(`/api/items/${itemId}/consume?quantity=1`)
            showToast('残量を1減らしました')
            onDone?.()
            await loadItems()
        } catch (err) {
            showToast(err.message)
        }
    }

    async function handleRestockItem(itemId, onDone) {
        try {
            await apiPost(`/api/items/${itemId}/restock?restock_quantity=1`)
            showToast('残量を更新しました')
            onDone?.()
            await loadItems()
        } catch (err) {
            showToast(err.message)
        }
    }

    return {
        items,
        itemCategoryOptions,
        categoryFilter,
        alertCount,
        page,
        pageSize: ITEM_PAGE_SIZE,
        total,
        loadItems,
        handleCategoryFilterChange,
        handlePageChange,
        handleCreateItem,
        handleUpdateItem,
        handleDeleteItem,
        handleConsumeItem,
        handleRestockItem,
    }
}

export default useItems