'use client'

import { ItemDocument } from '@/model/item'
import useOrderStore from '@/app/zustand/order'
import { Plus } from 'lucide-react'
import React from 'react'
import Button from "@/app/components/Button";
import { useTranslations } from "next-intl";
import { useShallow } from "zustand/react/shallow";

interface ItemProps {
    item: ItemDocument
}

export const Item = ({ item }: ItemProps) => {
    return (
        <article className="bg-white border-b border-gray-100 hover:bg-gray-50 transition-all duration-200">
            <div className="px-4 py-6 flex flex-col md:flex-row items-start justify-between gap-4">
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

interface ItemDetailsProps {
    item: ItemDocument
}

const ItemDetails = ({
                         item,
                     }: ItemDetailsProps) => {
    const hasIngredients = (item.ingredients && item.ingredients.length > 0) ?? false

    return (
        <div className="flex-1 min-w-0 cursor-pointer">
            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-700 transition-colors">
                {item.name}
            </h3>

            {hasIngredients && (
                <p className="text-sm text-gray-600 mb-3 leading-relaxed transition-all duration-300 line-clamp-none">
                    {item.ingredients?.join(', ')}
                </p>
            )}

            <div className="flex items-baseline gap-1">
          <span className="text-lg font-bold text-gray-900">
            {item.price.toFixed(2)}€
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
    const { addToOrder, itemCount } = useOrderStore(
        useShallow((state) => ({
            addToOrder: state.addToOrder,
            itemCount: state.getItemCount(item._id.toString()),
        }))
    )
    const isInCart = itemCount > 0

    const handleAddItem = () => addToOrder(item)

    return (
        <div className="shrink-0 flex flex-col items-center gap-2">
            <AddButton
                isInCart={isInCart}
                itemCount={itemCount}
                itemName={item.name}
                itemPrice={item.price}
                onAddItem={handleAddItem}
            />
        </div>
    )
};


interface AddButtonProps {
    isInCart: boolean
    itemCount: number
    itemName: string
    itemPrice: number
    onAddItem: () => void
}

const AddButton = ({ isInCart, itemCount, itemName, itemPrice, onAddItem }: AddButtonProps) => {
    const baseClasses = "relative font-semibold px-5 py-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 min-w-[110px] text-sm transform active:scale-95 overflow-hidden"

    const variantClasses = !isInCart
        ? "bg-white text-primary-700 hover:text-primary-800 hover:bg-primary-50 before:absolute before:inset-0 before:p-[2px] before:bg-gradient-to-r before:from-primary-400 before:via-orange-500 before:to-yellow-500 hover:before:from-primary-500 hover:before:via-orange-600 hover:before:to-red-600 before:rounded-xl before:transition-all before:duration-300 after:absolute after:inset-[2px] after:bg-white hover:after:bg-primary-50 after:rounded-[10px] after:transition-all after:duration-300"
        : "bg-white text-primary-800 hover:text-primary-900 before:absolute before:inset-0 before:p-[2px] before:bg-gradient-to-r before:from-primary-300 before:to-primary-400 hover:before:from-primary-400 hover:before:to-primary-500 before:rounded-xl before:transition-all before:duration-300 after:absolute after:inset-[2px] after:bg-white after:rounded-[10px]"

    const t = useTranslations();

    return (
        <Button
            onClick={onAddItem}
            className={`${baseClasses} ${variantClasses}`}
            aria-label={`Add ${itemName} to cart`}
        >
            <div className="flex items-center justify-center gap-2 relative z-10">
                {!isInCart ? (
                    <>
                        <Plus className="w-4 h-4"/>
                        <span className="font-bold">
                            {itemPrice.toFixed(2)}€ {t('Order.item.button.add')}
                        </span>
                    </>
                ) : (
                    <>
                        <span className="font-medium">
                            {t('Order.item.button.more')} {itemPrice.toFixed(2)}€
                        </span>
                        <div className="relative ml-1">
                            <Plus className="w-4 h-4 transition-transform hover:rotate-180"/>
                            <span
                                className="absolute -top-2 -right-3 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-bounce">
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
