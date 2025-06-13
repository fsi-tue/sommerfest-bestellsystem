import { ItemDocument } from "@/model/item"; // Assuming this path is correct
import OrderButton from "@/app/components/order/OrderButton";
import React, { useMemo } from "react";
import useOrderStore, { useCurrentOrder } from "@/app/zustand/order";
import { ArrowLeft, Plus, X } from "lucide-react";
import { TIME_SLOT_CONFIG } from "@/config";
import Timeline from "@/app/components/Timeline";
import ErrorMessage from "@/app/components/ErrorMessage";
import Button from "@/app/components/Button";
import { useTranslations } from 'next-intl';

interface OrderSummaryPageProps {
    onClose: () => void;
}

const OrderSummary: React.FC<OrderSummaryPageProps> = ({
                                                           onClose,
                                                       }) => {

    const order = useCurrentOrder();
    const { setError, error, getCurrentOrderTotal, setName, removeFromOrder, addToOrder } = useOrderStore();
    const t = useTranslations();

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

    // Timeline date range calculation (can be done outside component if static)
    const { start, end } = useMemo(() => {
        const startDate = new Date();
        startDate.setHours(startDate.getHours() - 1);
        startDate.setMinutes(0, 0, 0);

        const endDate = new Date();
        endDate.setHours(endDate.getHours() + 1);
        endDate.setMinutes(59, 59, 999);
        return { start: startDate, end: endDate };
    }, []);

    return (
        <div>
            <div className="mx-auto space-y-6">
                <div
                    className="flex flex-col bg-white border-2   shadow-lg rounded-2xl text-gray-900">

                    {/* 1. Header */}
                    <div className="flex justify-between items-center p-4 border-b shrink-0">
                        <Button
                            onClick={onClose}
                            className="text-primary-500 hover:text-gray-700 transition-colors"
                            aria-label="Close cart"
                        >
                            <ArrowLeft className="h-6 w-6"/>
                        </Button>
                        <h2 className="text-xl font-bold">{t('cart.title')}</h2>
                    </div>

                    <div className="grow overflow-y-auto p-4 space-y-4">
                        {/* Item List */}
                        {isEmpty ? (
                            <p className="text-center text-gray-500 py-6">{t('cart.messages.empty_cart')}</p>
                        ) : (
                            <div className="space-y-4">
                                {aggregatedItems.map(({ item, quantity }) => (
                                    <div key={item._id.toString() ?? item.name}
                                         className="flex flex-col border-b border-gray-100 pb-4 last:border-b-0">
                                        <div className="flex justify-between items-start gap-2">
                                            <span className="font-semibold grow">{item.name}</span>
                                            <span
                                                className="font-semibold shrink-0">{item.price.toFixed(2)} {t('cart.currency')}</span>
                                        </div>
                                        <div className="flex justify-between items-center mt-1">
                                            {/* Quantity Controls */}
                                            <div
                                                className="flex items-center gap-2 bg-gray-100 rounded-full px-2 py-0.5">
                                                <Button
                                                    onClick={() => removeFromOrder(item)}
                                                    className="text-gray-500 hover:text-red-600 disabled:opacity-50 transition-colors p-1"
                                                    aria-label={`Remove ${item.name}`}
                                                    // disabled={quantity <= 1} // Disable if only removing via trash
                                                >
                                                    <X className="h-4 w-4"/>
                                                </Button>
                                                <span className="font-medium w-5 text-center text-sm">{quantity}</span>
                                                <Button
                                                    onClick={() => addToOrder(item)}
                                                    className="text-gray-500 hover:text-green-600 transition-colors p-1"
                                                    aria-label={`Increase quantity of ${item.name}`}
                                                >
                                                    <Plus className="h-4 w-4"/>
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* TODO: Maybe add Note Button */}
                    {/* <button
                        // onClick={() => onAddNote(item)} // Add handler
                        className="text-sm text-blue-600 hover:underline focus:outline-none"
                    >
                        {t('cart.messages.add_note')}
                    </button> */}

                    <div className="grow overflow-y-auto p-4 space-y-4">
                        <div>
                            <h3 className="text-xl font-semibold mb-2">Details</h3>
                            <div className="flex justify-between text-sm text-gray-700 mt-2">
                                <span>{t('cart.total_price')}</span>
                                <span>{getCurrentOrderTotal().toFixed(2)}€</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-700 mt-2">
                                <span>{t('cart.timeslot.title')}</span>
                                <span>
                                    {order.timeslot}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="grow overflow-y-auto p-4 space-y-4">
                        <div className="mb-6 space-y-4">
                            <div>
                                <label htmlFor="name"
                                       className="block text-sm font-medium text-gray-700 mb-1">{t('cart.order.name')}</label>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    value={order.name}
                                    placeholder={t("cart.order.name_placeholder")}
                                    className="mt-1 p-3 border border-gray-100 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm"
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* Timeline Section */}
                        <div className="timeline-container mt-8">
                            <h4 className="text-xl font-semibold mb-2 text-gray-900">{t('cart.timeslot.title')}</h4>
                            <p className="mb-4 text-base font-light leading-relaxed text-gray-700">
                                {t('cart.timeslot.subtitle')}
                            </p>
                            <Timeline
                                startDate={start}
                                stopDate={end}
                                every_x_seconds={TIME_SLOT_CONFIG.UPDATE_EVERY_SECONDS}
                            />
                        </div>
                    </div>

                    {/* Error message */}
                    {error && (
                        <div className="px-4 py-2">
                            <ErrorMessage error={error}/>
                        </div>
                    )}

                    <div className="p-4 border-t border-gray-100 shrink-0">
                        {isEmpty ? (
                            <Button
                                onClick={onClose}
                                className="w-full md:w-auto font-semibold px-4 py-3 rounded-2xl  bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
                            >
                                {t('cart.messages.add_more_products')}
                            </Button>
                        ) : (
                            <OrderButton setError={setError}/>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderSummary;
