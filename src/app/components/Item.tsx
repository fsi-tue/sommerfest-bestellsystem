'use client'

import { ItemDocument } from '@/model/item'
import { useOrderActions } from '@/app/zustand/order'
import { Plus } from 'lucide-react'
import React, { useCallback, useState } from 'react'
import LoadingSpinner from "@/app/components/LoadingSpinner";
import Button from "@/app/components/Button";
import { useTranslation } from 'react-i18next';

interface ItemProps {
    item: ItemDocument
}

export const Item = ({ item }: ItemProps) => {
    const orderActions = useOrderActions()
    const itemCount = orderActions.getItemCount(item._id.toString())
    const [isAdding, setIsAdding] = useState(false)
    const [showDetails, setShowDetails] = useState(false)

    const handleAddItem = useCallback(async () => {
        if (isAdding) {
            return
        }

        setIsAdding(true)
        try {
            await orderActions.addToOrder(item)
        } catch (error) {
            console.error('Failed to add item to order:', error)
        } finally {
            setIsAdding(false)
        }
    }, [item, orderActions, isAdding])

    const handleRemoveItem = useCallback(async () => {
        if (itemCount <= 0) {
            return
        }

        try {
            await orderActions.removeFromOrder(item)
        } catch (error) {
            console.error('Failed to remove item from order:', error)
        }
    }, [item, itemCount, orderActions])

    const toggleDetails = useCallback(() => {
        setShowDetails(prev => !prev)
    }, [])

    const hasIngredients = (item.ingredients && item.ingredients.length > 0) ?? false
    const isInCart = itemCount > 0

    return (
        <article className="bg-white border-b border-gray-100 hover:bg-gray-50 transition-all duration-200">
            <div className="px-4 py-6 flex items-start justify-between gap-4">
                <ItemDetails
                    item={item}
                    showDetails={showDetails}
                    hasIngredients={hasIngredients}
                    itemCount={itemCount}
                    onToggleDetails={toggleDetails}
                />

                <ItemActions
                    itemCount={itemCount}
                    isAdding={isAdding}
                    isInCart={isInCart}
                    itemName={item.name}
                    onAddItem={handleAddItem}
                    onRemoveItem={handleRemoveItem}
                />
            </div>
        </article>
    )
}

// Extracted sub-components for better maintainability
interface ItemDetailsProps {
    item: ItemDocument
    showDetails: boolean
    hasIngredients: boolean
    itemCount: number
    onToggleDetails: () => void
}

const ItemDetails = ({
                         item,
                         showDetails,
                         hasIngredients,
                         itemCount,
                         onToggleDetails
                     }: ItemDetailsProps) => {
    const [t, i18n] = useTranslation();

    return (
        <div className="flex-1 min-w-0 cursor-pointer" onClick={onToggleDetails}>
            <h3 className="text-base font-semibold text-gray-900 mb-1 line-clamp-1 hover:text-primary-600 transition-colors">
                {item.name}
            </h3>

            {hasIngredients && (
                <p className={`text-sm text-gray-600 mb-3 leading-relaxed transition-all duration-300 ${
                    showDetails ? 'line-clamp-none' : 'line-clamp-2'
                }`}>
                    {item.ingredients?.join(', ')}
                </p>
            )}

            <div className="flex items-baseline gap-1">
          <span className="text-lg font-bold text-gray-900">
            {t('cart.currency')} {item.price.toFixed(2)}
          </span>
            </div>
        </div>
    )
};

interface ItemActionsProps {
    itemCount: number
    isAdding: boolean
    isInCart: boolean
    itemName: string
    onAddItem: () => void
    onRemoveItem: () => void
}

const ItemActions = ({
                         itemCount,
                         isAdding,
                         isInCart,
                         itemName,
                         onAddItem,
                         onRemoveItem
                     }: ItemActionsProps) => (
    <div className="shrink-0 flex flex-col items-center gap-2">
        <AddButton
            isAdding={isAdding}
            isInCart={isInCart}
            itemCount={itemCount}
            itemName={itemName}
            onAddItem={onAddItem}
        />
    </div>
)


interface AddButtonProps {
    isAdding: boolean
    isInCart: boolean
    itemCount: number
    itemName: string
    onAddItem: () => void
}

const AddButton = ({ isAdding, isInCart, itemCount, itemName, onAddItem }: AddButtonProps) => {
    const baseClasses = "font-medium px-4 py-2 rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 min-w-[80px] text-sm disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"

    const variantClasses = isInCart
        ? "bg-primary-100 hover:bg-primary-200 border-2 border-gray-200 hover:border-primary-500 text-gray-700 hover:text-primary-600"
        : "bg-white hover:bg-primary-50 border-2 border-gray-200 hover:border-primary-500 text-gray-700 hover:text-primary-600"

    const [t, i18n] = useTranslation();

    return (
        <Button
            onClick={onAddItem}
            disabled={isAdding}
            className={`${baseClasses} ${variantClasses}`}
            aria-label={`Add ${itemName} to cart`}
        >
            <div className="flex items-center justify-center min-w-[60px] px-3">
                {isAdding ? (
                    <div
                        className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full"
                        aria-label="Adding item..."
                    >
                        <LoadingSpinner/>
                    </div>
                ) : (
                    <>
                        <span>{t('order_view.item.button.add')}</span>
                        <div className="relative">
                            <Plus className="transition-transform group-hover:rotate-90"/>
                            <span
                                className="absolute -top-2 -right-4 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                                                {itemCount}
                                            </span>
                        </div>
                    </>
                )}
            </div>
        </Button>
    )
}

export default Item
