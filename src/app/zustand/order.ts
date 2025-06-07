import { ApiOrder, OrderDocument } from '@/model/order'
import { ItemDocument } from '@/model/item'
import { getDateFromTimeSlot } from '@/lib/time'
import { create } from 'zustand'
import { ORDER_CONFIG } from '@/config'

interface OrderState {
    orders: OrderDocument[]
    currentOrder: ApiOrder
    error: string | null

    actions: {
        // Error management
        setError: (error: string) => void
        clearError: () => void

        // Order management
        createNewOrder: () => void
        addOrder: (order: OrderDocument) => void
        removeOrder: (orderId: string) => void
        setCurrentOrder: (order: ApiOrder) => void

        // Current order updates
        updateOrder: (updatedOrder: Partial<ApiOrder>) => void
        setName: (name: string) => void
        setTimeslot: (timeslot: string) => void

        // Item item management (your specific structure)
        addToOrder: (item: ItemDocument) => void
        removeFromOrder: (item: ItemDocument) => void

        // Utility functions
        clearAllOrders: () => void
        getOrderById: (orderId: string) => OrderDocument | undefined
        getCurrentOrderTotal: () => number
        getItemCount: (itemId: string) => number
        getTotalItemCount: () => number
    }
}

// Constants (you can move these to a separate config file)
const ORDER = {
    TIMESLOT_DURATION: 30 // Time buffer in minutes
}

const useOrderStore = create<OrderState>()((set, get) => ({
    orders: [],
    currentOrder: {
        name: '',
        items: {},
        comment: '',
        timeslot: null
    },
    error: null,

    actions: {
        // Error management
        setError: (error) => set({ error }),

        clearError: () => set({ error: null }),

        // Create a new empty order
        createNewOrder: () => set({
            currentOrder: {
                name: '',
                items: {},
                comment: '',
                timeslot: null
            },
            error: null
        }),

        // Add a completed order to the orders list
        addOrder: (order) => set((state) => ({
            orders: [...state.orders, order]
        })),

        // Remove an order by ID
        removeOrder: (orderId) => set((state) => ({
            orders: state.orders.filter(order => order._id.toString() !== orderId)
        })),

        // Set the current order
        setCurrentOrder: (order) => set({ currentOrder: order }),

        // Update current order with partial data
        updateOrder: (updatedOrder) => set((state) => ({
            currentOrder: { ...state.currentOrder, ...updatedOrder }
        })),

        // Set the name of the current order
        setName: (name) => {
            const { updateOrder } = get().actions
            updateOrder({ name })
        },

        // Set timeslot with validation
        setTimeslot: (timeslot) => {
            const { clearError, setError, updateOrder } = get().actions
            clearError()

            const BUFFER = ORDER.TIMESLOT_DURATION // Time buffer in minutes
            const currentTimeWithBuffer = new Date()
            currentTimeWithBuffer.setMinutes(currentTimeWithBuffer.getMinutes() + BUFFER)

            try {
                const timeslotTime = getDateFromTimeSlot(timeslot).toDate()

                if (timeslotTime < currentTimeWithBuffer) {
                    setError('Selected timeslot is too soon or in the past.')
                    // Auto-clear error after 5s
                    setTimeout(() => clearError(), 5000)
                    return // Prevent setting the invalid timeslot
                }

                updateOrder({ timeslot }) // Update if valid

            } catch (e) {
                console.error("Error parsing timeslot:", e)
                setError("Invalid timeslot selected.")
                setTimeout(() => clearError(), 5000)
            }
        },

        // Add item item to current order
        addToOrder: (item) => {
            const { setError, clearError, getTotalItemCount } = get().actions
            clearError() // Clear any previous errors when adding items

            set((state) => {
                const itemId = item._id.toString()
                const currentItems = state.currentOrder.items[itemId] ?? []
                const updatedItems = [...currentItems, item]

                if (getTotalItemCount() >= ORDER_CONFIG.MAX_ITEMS_PER_TIMESLOT) {
                    setError('Max. amount of items reached')
                    return state
                }

                return {
                    ...state,
                    currentOrder: {
                        ...state.currentOrder,
                        items: {
                            ...state.currentOrder.items,
                            [itemId]: updatedItems,
                        },
                    },
                }
            })
        },

        // Remove item item from current order
        removeFromOrder: (item) => {
            const { clearError } = get().actions
            clearError()

            set((state) => {
                const itemId = item._id.toString()
                const currentItems = state.currentOrder.items[itemId] ?? []

                if (currentItems.length === 0) {
                    return state // Should not happen with this structure, but safe check
                }

                const updatedItems = currentItems.slice(0, -1) // Remove the last item instance
                const newItemsState = { ...state.currentOrder.items }

                if (updatedItems.length === 0) {
                    delete newItemsState[itemId] // Remove the key if no items of this type remain
                } else {
                    newItemsState[itemId] = updatedItems
                }

                return {
                    ...state,
                    currentOrder: {
                        ...state.currentOrder,
                        items: newItemsState,
                    },
                }
            })
        },

        // Clear all orders
        clearAllOrders: () => set({
            orders: [],
            currentOrder: {
                name: '',
                items: {},
                comment: '',
                timeslot: null
            },
            error: null
        }),

        // Get order by ID
        getOrderById: (orderId) => {
            const state = get()
            return state.orders.find(order => order._id.toString() === orderId)
        },

        // Calculate total for current order
        getCurrentOrderTotal: () => {
            const state = get()
            const items = state.currentOrder.items

            return Object.values(items).reduce((total, itemArray) => {
                return total + itemArray.reduce((subtotal, item) => {
                    return subtotal + (item.price || 0)
                }, 0)
            }, 0)
        },

        // Get count of specific item in current order
        getItemCount: (itemId) => {
            const state = get()
            return state.currentOrder.items[itemId]?.length || 0
        },

        // Get total count of all items in current order
        getTotalItemCount: () => {
            const state = get()
            const items = state.currentOrder.items

            return Object.values(items).reduce((total, itemArray) => {
                return total + itemArray.length
            }, 0)
        }
    }
}))

// Export custom hooks for easier usage
export const useOrders = () => useOrderStore((state) => state.orders)
export const useCurrentOrder = () => useOrderStore((state) => state.currentOrder)
export const useOrderError = () => useOrderStore((state) => state.error)
export const useOrderActions = () => useOrderStore((state) => state.actions)

// Export specific selectors
export const useOrderById = (orderId: string) =>
    useOrderStore((state) => state.orders.find(order => order._id.toString() === orderId))

export const useCurrentOrderTotal = () =>
    useOrderStore((state) => state.actions.getCurrentOrderTotal())

export const useItemCount = (itemId: string) =>
    useOrderStore((state) => state.actions.getItemCount(itemId))

export const useTotalItemCount = () =>
    useOrderStore((state) => state.actions.getTotalItemCount())

export default useOrderStore
