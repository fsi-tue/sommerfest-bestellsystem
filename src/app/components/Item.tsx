'use client'

import { ItemDocument } from '@/model/item'
import useOrderStore from '@/app/zustand/order'
import { Plus } from 'lucide-react'
import React, { useCallback } from 'react'
import Button from "@/app/components/Button";
import { useTranslations } from "next-intl";

interface ItemProps {
    item: ItemDocument
}

export const Item = ({ item }: ItemProps) => {
    return (
        <article className="bg-white border-b border-gray-100 hover:bg-gray-50 transition-all duration-200">
            <div className="px-4 py-6 flex items-start justify-between gap-4">
                <ItemDetails
                    item={item}
                />

                <ItemActions
                    item={item}
                />
            </div>
        </article>
    )
}

// Extracted sub-components for better maintainability
interface ItemDetailsProps {
    item: ItemDocument
}

const ItemDetails = ({
                         item,
                     }: ItemDetailsProps) => {
    const t = useTranslations();
    const hasIngredients = (item.ingredients && item.ingredients.length > 0) ?? false

    return (
        <div className="flex-1 min-w-0 cursor-pointer">
            <h3 className="text-base font-semibold text-gray-900 mb-1 line-clamp-1 transition-colors">
                {item.name}
            </h3>

            {hasIngredients && (
                <p className="text-sm text-gray-600 mb-3 leading-relaxed transition-all duration-300 line-clamp-none">
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
    item: ItemDocument
}

const ItemActions = ({
                         item,
                     }: ItemActionsProps) => {
    const orderStore = useOrderStore()
    const itemCount = orderStore.getItemCount(item._id.toString())
    const isInCart = itemCount <= 0

    const handleAddItem = useCallback(async () => {
        orderStore.addToOrder(item)
    }, [item])

    const handleRemoveItem = useCallback(async () => {
        if (itemCount <= 0) {
            return
        }

        orderStore.removeFromOrder(item)
    }, [item, itemCount])

    return (
        <div className="shrink-0 flex flex-col items-center gap-2">
            <AddButton
                isInCart={isInCart}
                itemCount={itemCount}
                itemName={item.name}
                onAddItem={handleAddItem}
            />
        </div>
    )
};


interface AddButtonProps {
    isInCart: boolean
    itemCount: number
    itemName: string
    onAddItem: () => void
}

const AddButton = ({ isInCart, itemCount, itemName, onAddItem }: AddButtonProps) => {
    const baseClasses = "font-medium px-4 py-2 rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 min-w-[80px] text-sm disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"

    const variantClasses = isInCart
        ? "bg-primary-100 hover:bg-primary-200 border-2 border-gray-200 hover:border-primary-500 text-gray-700 hover:text-primary-600"
        : "bg-white hover:bg-primary-50 border-2 border-gray-200 hover:border-primary-500 text-gray-700 hover:text-primary-600"

    const t = useTranslations();

    return (
        <Button
            onClick={onAddItem}
            className={`${baseClasses} ${variantClasses}`}
            aria-label={`Add ${itemName} to cart`}
        >
            <div className="flex items-center justify-center min-w-[60px] px-3">
                <span>{t('order_view.item.button.add')}</span>
                <div className="relative">
                    <Plus className="transition-transform group-hover:rotate-90"/>
                    <span
                        className="absolute -top-2 -right-4 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                                                {itemCount}
                                            </span>
                </div>
            </div>
        </Button>
    )
}

export default Item
