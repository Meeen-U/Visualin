import { useState } from 'react'
import { apiGet, apiPost, apiPut, apiDelete } from '../api/client'

// 消耗品の一覧取得・CRUD・絞り込みをまとめたカスタムフック

function useItems({ showToast, showConfirm }) {
    const [items, setItems] = useState([])
    const [categoryFilter, setCategoryFilter] = useState('')

    async function loadItems() {
        const data = await apiGet('/api/items')
        setItems(data.items)
    }

    const itemCategoryOptions = [
        ...new Set(items.map((item) => item.category).filter(Boolean)),
    ]

    const filteredItems = categoryFilter
        ? items.filter((item) => item.category === categoryFilter)
        : items

    // アラート中を上、それ以外を下に
    const sortedItems = [...filteredItems].sort((a, b) => {
        if (a.is_alert === b.is_alert) return 0
        return a.is_alert ? -1 : 1
    })

    const alertCount = items.filter((item) => item.is_alert).length

    async function handleCreateItem(itemInput, onDone) {
        try {
            await apiPost('/api/items', itemInput)
            showToast('消耗品を登録しました')
            onDone?.()
            await loadItems()
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
            await apiPost(`/api/item/${itemId}/restock?restock_quantity=1`)
            showToast('残量を更新しました')
            onDone?.()
            await loadItems()
        } catch (err) {
            showToast(err.message)
        }
    }

    return {
        items,
        sortedItems,
        itemCategoryOptions,
        categoryFilter,
        alertCount,
        loadItems,
        handleConsumeItem,
        handleUpdateItem,
        handleDeleteItem,
        handleConsumeItem,
        handleRestockItem,
    }
}

export default useItems