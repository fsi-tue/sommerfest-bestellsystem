import { ItemDocument } from "@/model/item"; // Assuming this path is correct
import { PlusIcon, TrashIcon, XMarkIcon, } from "@heroicons/react/24/outline";
import OrderButton from "@/app/components/order/OrderButton";
import React, { useState } from "react";
import { useCurrentOrder, useOrderActions } from "@/app/zustand/order";
import { useTranslation } from "react-i18next";

interface OrderSummaryPageProps {
    onClose: () => void;
}

const OrderSummary: React.FC<OrderSummaryPageProps> = ({
                                                           onClose,
                                                       }) => {

    const [error, setError] = useState<string | null>(null);

    const order = useCurrentOrder();
    const orderActions = useOrderActions();
    const [t, i18n] = useTranslation();

    // Use a structure that includes quantity for each unique item
    // This is a simplified example; you'll need logic to aggregate items
    const aggregatedItems = Object.values(order?.items ?? {})
        .flatMap(list => list)
        .reduce((acc, item) => {
            const existing = acc.find(i => i.item._id === item._id);
            if (existing) {
                existing.quantity += 1;
            } else {
                acc.push({ item: item, quantity: 1 });
            }
            return acc;
        }, [] as { item: ItemDocument, quantity: number }[]);

    const isEmpty = aggregatedItems.length === 0;

    return (
        <div
            className="flex flex-col h-full max-w-md bg-white border-2 border-primary-950 shadow-primary-300 shadow-lg rounded-2xl text-gray-900">

            {/* 1. Header */}
            <div className="flex justify-between items-center p-4 border-b flex-shrink-0">
                <h2 className="text-xl font-bold">{t('cart.title')}</h2>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-700 transition-colors"
                    aria-label="Close cart"
                >
                    <XMarkIcon className="h-6 w-6"/>
                </button>
            </div>

            <div className="flex-grow overflow-y-auto p-4 space-y-4">
                {/* Item List */}
                {isEmpty ? (
                    <p className="text-center text-gray-500 py-6">{t('cart.messages.empty_cart')}</p>
                ) : (
                    <div className="space-y-4">
                        {aggregatedItems.map(({ item, quantity }) => (
                            <div key={item._id.toString() ?? item.name}
                                 className="flex flex-col border-b border-gray-100 pb-4 last:border-b-0">
                                <div className="flex justify-between items-start gap-2">
                                    <span className="font-semibold flex-grow">{item.name}</span>
                                    <span className="font-semibold flex-shrink-0">{item.price.toFixed(2)} {t('cart.currency')}</span>
                                </div>
                                <div className="flex justify-between items-center mt-1">
                                    {/* Add Note Button */}
                                    <button
                                        // onClick={() => onAddNote(item)} // Add handler
                                        className="text-sm text-blue-600 hover:underline focus:outline-none"
                                    >
                                        {t('cart.messages.add_note')}
                                    </button>

                                    {/* Quantity Controls */}
                                    <div className="flex items-center gap-2 bg-gray-100 rounded-full px-2 py-0.5">
                                        <button
                                            onClick={() => orderActions.removeFromOrder(item)}
                                            className="text-gray-500 hover:text-red-600 disabled:opacity-50 transition-colors p-1"
                                            aria-label={`Remove ${item.name}`}
                                            // disabled={quantity <= 1} // Disable if only removing via trash
                                        >
                                            <TrashIcon className="h-4 w-4"/>
                                        </button>
                                        <span className="font-medium w-5 text-center text-sm">{quantity}</span>
                                        <button
                                            // onClick={() => onUpdateQuantity(item, quantity + 1)} // Add handler
                                            className="text-gray-500 hover:text-green-600 transition-colors p-1"
                                            aria-label={`Increase quantity of ${item.name}`}
                                        >
                                            <PlusIcon className="h-4 w-4"/>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="p-4 border-t border-gray-100 flex-shrink-0">
                {isEmpty ? (
                    <button
                        onClick={onClose} // Or navigate to menu
                        className="w-full bg-gray-200 text-gray-700 py-3 rounded-full font-semibold hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
                    >
                        {t('cart.messages.add_more_products')}
                    </button>
                ) : (
                    <OrderButton setError={setError}/>
                )}
            </div>
        </div>
    );
};

export default OrderSummary;
