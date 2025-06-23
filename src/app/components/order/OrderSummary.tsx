import { ItemDocument } from "@/model/item";
import OrderButton from "@/app/components/order/OrderButton";
import React from "react";
import useOrderStore, { useCurrentOrder } from "@/app/zustand/order";
import { ArrowLeft, Clock, MinusIcon, PlusIcon, ShoppingCart, User } from "lucide-react";
import Timeline from "@/app/components/Timeline";
import Button from "@/app/components/Button";
import { useTranslations } from 'next-intl';
import { timeslotToLocalTime } from "@/lib/time";
import ErrorMessage from "@/app/components/ErrorMessage";

interface OrderSummaryPageProps {
    onClose: () => void;
}

const OrderSummary: React.FC<OrderSummaryPageProps> = ({ onClose }) => {
    const order = useCurrentOrder();
    const { setError, error, getCurrentOrderTotal, setName, removeFromOrder, addToOrder } = useOrderStore();
    const t = useTranslations();

    // Aggregate items with quantities
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
    const totalItems = aggregatedItems.reduce((sum, { quantity }) => sum + quantity, 0);

    return (
        <div className="fixed inset-0 bg-gray-50 z-50 flex flex-col">
            {/* Mobile Header - Sticky */}
            <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
                <div className="flex items-center justify-between px-4 py-3">
                    <Button
                        onClick={onClose}
                        className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        aria-label="Close cart"
                    >
                        <ArrowLeft className="h-6 w-6"/>
                    </Button>
                    <div className="text-center">
                        <h1 className="text-lg font-semibold text-gray-900">{t('OrderSummary.title')}</h1>
                        <p className="text-sm text-gray-500">
                            {isEmpty ? 'Empty cart' : `${totalItems} item${totalItems !== 1 ? 's' : ''}`}
                        </p>
                    </div>
                    {!isEmpty && (
                        <div className="text-right">
                            <div className="text-lg font-bold text-primary-600">
                                €{getCurrentOrderTotal().toFixed(2)}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
                <div className="px-4 py-4 space-y-4">
                    {/* Cart Items Section */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        {isEmpty ? (
                            <div className="text-center py-12 px-4">
                                <div
                                    className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                    <ShoppingCart className="h-8 w-8 text-gray-400"/>
                                </div>
                                <p className="text-gray-500 text-lg mb-2">{t('OrderSummary.messages.empty_cart')}</p>
                                <p className="text-gray-400 text-sm">Add some delicious items to get started</p>
                            </div>
                        ) : (
                            <div className="p-4">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <ShoppingCart className="h-5 w-5 mr-2 text-primary-600"/>
                                    {t('OrderSummary.title')}
                                </h2>

                                <div className="space-y-3">
                                    {aggregatedItems.map(({ item, quantity }) => (
                                        <div key={item._id.toString() ?? item.name}
                                             className="bg-gray-50 rounded-lg p-3">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex-1 pr-2">
                                                    <h3 className="font-medium text-gray-900 text-base leading-tight">
                                                        {item.name}
                                                    </h3>
                                                    {item.type && (
                                                        <span
                                                            className="inline-block mt-1 px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">
                                                            {item.type}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-lg font-semibold text-primary-600">
                                                        €{item.price.toFixed(2)}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center">
                                                <div
                                                    className="flex items-center bg-white border border-gray-300 rounded-lg">
                                                    <Button
                                                        onClick={() => removeFromOrder(item)}
                                                        className="p-3 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-l-lg transition-colors"
                                                        aria-label={`Remove ${item.name}`}
                                                    >
                                                        <MinusIcon className="h-5 w-5"/>
                                                    </Button>
                                                    <span
                                                        className="px-4 py-3 font-medium text-gray-900 min-w-[3rem] text-center">
                                                        {quantity}
                                                    </span>
                                                    <Button
                                                        onClick={() => addToOrder(item)}
                                                        className="p-3 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-r-lg transition-colors"
                                                        aria-label={`Add ${item.name}`}
                                                    >
                                                        <PlusIcon className="h-5 w-5"/>
                                                    </Button>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-semibold text-gray-900">
                                                        €{(item.price * quantity).toFixed(2)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {!isEmpty && (
                        <>
                            {/* Customer Details Section */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <User className="h-5 w-5 mr-2 text-primary-600"/>
                                    {t('OrderSummary.OrderDetails.yourDetails')}
                                </h2>

                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('OrderSummary.OrderDetails.name')}
                                    </label>
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        value={order.name}
                                        placeholder={t("OrderSummary.OrderDetails.name_placeholder")}
                                        className="w-full px-4 py-4 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Pickup Time Section */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <Clock className="h-5 w-5 mr-2 text-primary-600"/>
                                    {t('OrderSummary.Timeslot.title')}
                                </h2>

                                {order.timeslot && (
                                    <div className="mb-4 p-3 bg-primary-50 border border-primary-200 rounded-lg">
                                        <div className="flex items-center space-x-2">
                                            <Clock className="h-4 w-4 text-primary-600"/>
                                            <span className="text-primary-800 font-medium">
                                                {timeslotToLocalTime(order.timeslot)}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <Timeline noClick={false}/>
                            </div>

                            {/* Order Summary */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('OrderSummary.Summary.title')}</h2>

                                <div className="space-y-3">
                                    <div className="flex justify-between text-gray-600">
                                        <span>{t('OrderSummary.Summary.subtotal', { amount: totalItems })}</span>
                                        <span>€{getCurrentOrderTotal().toFixed(2)}</span>
                                    </div>
                                    <div className="border-t border-gray-200 pt-3">
                                        <div className="flex justify-between text-xl font-bold text-gray-900">
                                            <span>{t('OrderSummary.Summary.total_price')}</span>
                                            <span>€{getCurrentOrderTotal().toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}


                    {/* Bottom spacing for sticky button */}
                    <div className="h-20"></div>
                </div>
            </div>

            {/* Sticky Bottom Action Button */}
            <div className="bg-white border-t border-gray-200 p-4 sticky bottom-0 z-20">
                {error && (
                    <ErrorMessage error={error}/>
                )}
                {isEmpty ? (
                    <Button
                        onClick={onClose}
                        className="w-full py-4 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors text-lg"
                    >
                        {t('OrderSummary.messages.add_more_products')}
                    </Button>
                ) : (
                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm text-gray-600">
                            <span>Ready to place your order?</span>
                            <span className="font-semibold text-lg">€{getCurrentOrderTotal().toFixed(2)}</span>
                        </div>
                        <OrderButton setError={setError}/>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderSummary;
