import { OrderType } from "@/app/page"; // Assuming this path is correct
import { FoodDocument } from "@/model/food"; // Assuming this path is correct
import { PlusIcon, TrashIcon, XMarkIcon, } from "@heroicons/react/24/outline";
import OrderButton from "@/app/components/order/OrderButton";
import { useState } from "react"; // Using outline icons for a lighter look, adjust as needed

interface OrderSummaryPageProps {
    order: OrderType;
    totalItems: number
    totalPrice: number;
    onRemoveFromOrder: (food: FoodDocument) => void; // For the trash icon
    // --- New props needed for full functionality based on image ---
    // onUpdateQuantity: (food: FoodDocument, newQuantity: number) => void; // To handle + and -
    // onAddNote: (food: FoodDocument) => void; // To handle 'Anmerkung hinzufügen'
    onClose: () => void;
}

const OrderSummary = ({
                          order,
                          totalPrice,
                          onRemoveFromOrder,
                          onClose,
                      }: OrderSummaryPageProps) => {

    const [error, setError] = useState<string | null>(null);

    // Use a structure that includes quantity for each unique item
    // This is a simplified example; you'll need logic to aggregate items
    const aggregatedItems = Object.values(order.items)
        .flatMap(list => list)
        .reduce((acc, item) => {
            const existing = acc.find(i => i.food._id === item._id);
            if (existing) {
                existing.quantity += 1;
            } else {
                acc.push({ food: item, quantity: 1 });
            }
            return acc;
        }, [] as { food: FoodDocument, quantity: number }[]);

    const isEmpty = aggregatedItems.length === 0;

    return (
        <div
            className="flex flex-col h-full max-w-md bg-white border-2 border-primary-950 shadow-primary-300 shadow-lg rounded-lg text-gray-900">

            {/* 1. Header */}
            <div className="flex justify-between items-center p-4 border-b flex-shrink-0">
                <h2 className="text-xl font-bold">Warenkorb</h2>
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
                    <p className="text-center text-gray-500 py-6">Dein Warenkorb ist leer.</p>
                ) : (
                    <div className="space-y-4">
                        {aggregatedItems.map(({ food, quantity }) => (
                            <div key={food._id.toString() ?? food.name}
                                 className="flex flex-col border-b border-gray-100 pb-4 last:border-b-0">
                                <div className="flex justify-between items-start gap-2">
                                    <span className="font-semibold flex-grow">{food.name}</span>
                                    <span className="font-semibold flex-shrink-0">{food.price.toFixed(2)} €</span>
                                </div>
                                <div className="flex justify-between items-center mt-1">
                                    {/* Add Note Button */}
                                    <button
                                        // onClick={() => onAddNote(food)} // Add handler
                                        className="text-sm text-blue-600 hover:underline focus:outline-none"
                                    >
                                        Anmerkung hinzufügen
                                    </button>

                                    {/* Quantity Controls */}
                                    <div className="flex items-center gap-2 bg-gray-100 rounded-full px-2 py-0.5">
                                        <button
                                            onClick={() => onRemoveFromOrder(food)} // Or onUpdateQuantity(food, quantity - 1) with check for 0
                                            className="text-gray-500 hover:text-red-600 disabled:opacity-50 transition-colors p-1"
                                            aria-label={`Remove ${food.name}`}
                                            // disabled={quantity <= 1} // Disable if only removing via trash
                                        >
                                            <TrashIcon className="h-4 w-4"/>
                                        </button>
                                        <span className="font-medium w-5 text-center text-sm">{quantity}</span>
                                        <button
                                            // onClick={() => onUpdateQuantity(food, quantity + 1)} // Add handler
                                            className="text-gray-500 hover:text-green-600 transition-colors p-1"
                                            aria-label={`Increase quantity of ${food.name}`}
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

            <div className="p-4 border-t border-gray-200 flex-shrink-0">
                {isEmpty ? (
                    <button
                        onClick={onClose} // Or navigate to menu
                        className="w-full bg-gray-200 text-gray-700 py-3 rounded-full font-semibold hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
                    >
                        Weitere Produkte hinzufügen
                    </button>
                ) : (
                    <OrderButton
                        order={order} setError={setError}/>
                )}
            </div>
        </div>
    );
};

export default OrderSummary;
