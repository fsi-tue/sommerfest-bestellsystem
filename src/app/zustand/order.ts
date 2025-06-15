import { ApiOrder, OrderDocument } from '@/model/order'
import { ItemDocument } from '@/model/item'
import { timeslotToDate, timeslotToUTCTime } from '@/lib/time'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

const initialOrder: ApiOrder = {
    name: '',
    items: {},
    comment: '',
    timeslot: null,
}

interface OrderState {
    orders: OrderDocument[]
    currentOrder: ApiOrder
    error: string | null

    // Error management
    setError: (msg: string) => void
    clearError: () => void

    // Order management
    createNewOrder: () => void
    addOrder: (order: OrderDocument) => void
    removeOrder: (orderId: string) => void
    setCurrentOrder: (order: ApiOrder) => void

    // Current order updates
    updateOrder: (partial: Partial<ApiOrder>) => void
    setName: (name: string) => void
    setTimeslot: (slot: string) => void

    // Item management
    addToOrder: (item: ItemDocument) => void
    removeFromOrder: (item: ItemDocument) => void

    // Utilities
    clearAllOrders: () => void
    getOrderById: (id: string) => OrderDocument | undefined
    getCurrentOrderTotal: () => number
    getItemCount: (itemId: string) => number
    getTotalItemCount: () => number
}

const useOrderStore = create<OrderState>()(
    persist(
        (set, get) => ({
            orders: [],
            currentOrder: initialOrder,
            error: null,

            /* ---------- error helpers ---------- */
            setError: (msg) => set((s) => ({ ...s, error: msg })),
            clearError: () => set((s) => ({ ...s, error: null })),

            /* ---------- order helpers ---------- */
            createNewOrder: () =>
                set((s) => ({ ...s, currentOrder: initialOrder, error: null })),

            addOrder: (order) =>
                set((s) => ({ ...s, orders: [...s.orders, order] })),

            removeOrder: (id) =>
                set((s) => ({
                    ...s,
                    orders: s.orders.filter((o) => o._id.toString() !== id),
                })),

            setCurrentOrder: (order) => set((s) => ({ ...s, currentOrder: order })),

            updateOrder: (partial) =>
                set((s) => ({ ...s, currentOrder: { ...s.currentOrder, ...partial } })),

            setName: (name) => get().updateOrder({ name }),

            /* ---------- timeslot with validation ---------- */
            setTimeslot: (slot) =>
                set((s) => {
                    const cutoff = new Date()

                    try {
                        const tsDate = timeslotToDate(slot)
                        if (tsDate < cutoff) {
                            return { ...s, error: 'Selected timeslot is in the past.' }
                        }
                        return {
                            ...s,
                            error: null,
                            // convert the timeslot to UTC
                            currentOrder: { ...s.currentOrder, timeslot: timeslotToUTCTime(slot) },
                        }
                    } catch {
                        return { ...s, error: 'Invalid timeslot selected.' }
                    }
                }),

            /* ---------- add / remove items ---------- */
            addToOrder: (item) =>
                set((s) => {
                    const id = item._id.toString()
                    const updated = [...(s.currentOrder.items[id] ?? []), item]

                    return {
                        ...s,
                        error: null,
                        currentOrder: {
                            ...s.currentOrder,
                            items: { ...s.currentOrder.items, [id]: updated },
                        },
                    }
                }),

            removeFromOrder: (item) =>
                set((s) => {
                    const id = item._id.toString()
                    const arr = s.currentOrder.items[id] ?? []
                    if (!arr.length) {
                        return s
                    } // nothing to remove

                    const updatedItems = arr.slice(0, -1)
                    const newItems = { ...s.currentOrder.items }
                    updatedItems.length ? (newItems[id] = updatedItems) : delete newItems[id]

                    return {
                        ...s,
                        error: null,
                        currentOrder: { ...s.currentOrder, items: newItems },
                    }
                }),

            /* ---------- misc utilities ---------- */
            clearAllOrders: () => set({ orders: [], currentOrder: initialOrder, error: null }),

            getOrderById: (id) => get().orders.find((o) => o._id.toString() === id),

            getCurrentOrderTotal: () => {
                const items = get().currentOrder.items
                return Object.values(items).reduce(
                    (tot, arr) => tot + arr.reduce((s, it) => s + (it.price || 0), 0),
                    0
                )
            },

            getItemCount: (id) => get().currentOrder.items[id]?.length || 0,

            getTotalItemCount: () => {
                const items = get().currentOrder.items
                return Object.values(items).reduce((tot, arr) => tot + arr.length, 0)
            },
        }),
        {
            name: 'order-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
)

export const useCurrentOrder = () => useOrderStore((s) => s.currentOrder)
export default useOrderStore
