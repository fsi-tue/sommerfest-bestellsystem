'use client';

import { useCallback, useEffect, useMemo, useState } from "react"; // Added useCallback, useMemo
import WithSystemCheck from "@/app/WithSystemCheck"; // Keep HOC wrapper
import { getDateFromTimeSlot } from "@/lib/time";
import { ORDER } from "@/config";
import { FoodDocument } from '@/model/food';

import IntroductionSection from '@/app/components/IntroductionSection';
import MenuSection from '@/app/components/MenuSection';
import OrderSection from '@/app/components/OrderSection';
import FloatingOrderSummary from '@/app/components/FloatingOrderSummary';
import OrderSummary from "@/app/components/order/OrderSummary";

const EVERY_X_SECONDS = 60; // Keep constant here or move to config

// Define OrderType interface (can be moved to a separate types file, e.g., @/types/order.ts)
export interface OrderType {
    name: string;
    // Using a map where key is food._id and value is an array of identical food items
    items: { [_id: string]: FoodDocument[] };
    comment: string;
    timeslot: string | null;
}

const Page = () => {
    const [error, setError] = useState('');
    const [foods, setFoods] = useState<{ [_id: string]: FoodDocument[] }>({});
    const [isMenuLoading, setIsMenuLoading] = useState(true); // Add loading state for menu
    const [ordersOpen, openOrders] = useState(false);
    const [order, setOrder] = useState<OrderType>({
        name: '',
        items: {},
        comment: '',
        timeslot: null,
    })

    // --- Data Fetching ---
    useEffect(() => {
        setIsMenuLoading(true);
        fetch("/api/pizza") // Consider moving fetch logic to a dedicated service/hook
            .then(async response => {
                const data = await response.json();
                if (!response.ok) {
                    const error = data?.message ?? response?.statusText;
                    throw new Error(error);
                }
                // Assuming data is already grouped by _id, otherwise group it here if needed
                setFoods(data);
            })
            .catch(error => {
                console.error('Error fetching pizza menu:', error);
                setError(`Failed to load menu: ${error.message}`); // Provide more context
            })
            .finally(() => {
                setIsMenuLoading(false);
            });
    }, []); // Empty dependency array ensures this runs once on mount

    // --- State Update Handlers (Memoized) ---
    const clearError = useCallback(() => {
        setError('');
    }, []);

    const updateOrder = useCallback((updatedOrder: Partial<OrderType>) => {
        setOrder(prevOrder => ({ ...prevOrder, ...updatedOrder }));
    }, []); // No dependencies needed

    const addToOrder = useCallback((food: FoodDocument) => {
        clearError(); // Clear any previous errors when adding items
        const foodId = food._id.toString();
        setOrder(prevOrder => {
            const currentItems = prevOrder.items[foodId] ?? [];
            const updatedItems = [...currentItems, food];
            return {
                ...prevOrder,
                items: {
                    ...prevOrder.items,
                    [foodId]: updatedItems,
                },
            };
        });
    }, [clearError]);

    const removeFromOrder = useCallback((food: FoodDocument) => {
        clearError();
        const foodId = food._id.toString();
        setOrder(prevOrder => {
            const currentItems = prevOrder.items[foodId] ?? [];
            if (currentItems.length === 0) {
                return prevOrder;
            } // Should not happen with this structure, but safe check

            const updatedItems = currentItems.slice(0, -1); // Remove the last item instance

            const newItemsState = { ...prevOrder.items };
            if (updatedItems.length === 0) {
                delete newItemsState[foodId]; // Remove the key if no items of this type remain
            } else {
                newItemsState[foodId] = updatedItems;
            }

            return {
                ...prevOrder,
                items: newItemsState,
            };
        });
    }, [clearError]);

    const setTimeslot = useCallback((timeslot: string) => {
        clearError();
        const BUFFER = ORDER.TIMESLOT_DURATION; // Time buffer in minutes
        const currentTimeWithBuffer = new Date();
        currentTimeWithBuffer.setMinutes(currentTimeWithBuffer.getMinutes() + BUFFER);

        try {
            const timeslotTime = getDateFromTimeSlot(timeslot).toDate(); // Ensure this function handles invalid formats gracefully

            if (timeslotTime < currentTimeWithBuffer) {
                setError('Selected timeslot is too soon or in the past.');
                // Optionally clear the timeslot visually if invalid
                // updateOrder({ timeslot: null });
                setTimeout(() => clearError(), 5000); // Auto-clear error after 5s
                return; // Prevent setting the invalid timeslot
            }

            updateOrder({ timeslot }); // Update if valid

        } catch (e) {
            console.error("Error parsing timeslot:", e);
            setError("Invalid timeslot selected.");
            setTimeout(() => clearError(), 5000);
        }

    }, [updateOrder, clearError]); // Dependencies

    const setName = useCallback((name: string) => {
        updateOrder({ name });
    }, [updateOrder]);

    // --- Derived State / Calculations (Memoized) ---
    const { totalItems, totalPrice } = useMemo(() => {
        let itemsCount = 0;
        let priceTotal = 0;
        Object.values(order.items).forEach(itemList => {
            itemsCount += itemList.length;
            itemList.forEach(item => {
                priceTotal += item.price;
            });
        });
        return { totalItems: itemsCount, totalPrice: priceTotal };
    }, [order.items]);

    // Timeline date range calculation (can be done outside component if static)
    const { start, end } = useMemo(() => {
        const startDate = new Date();
        startDate.setHours(startDate.getHours() - 1);
        startDate.setMinutes(0, 0, 0);

        const endDate = new Date();
        endDate.setHours(endDate.getHours() + 1);
        endDate.setMinutes(59, 59, 999);
        return { start: startDate, end: endDate };
    }, []); // Calculate once

    // --- Render ---
    return (
        // Using a fragment as the outer div is provided by layout.tsx
        <>
            {!ordersOpen ? (
                <>
                    <IntroductionSection/>

                    <div
                        className="bg-white p-6 md:p-8 rounded-lg shadow-md mb-24"> {/* Increased bottom margin for floating island */}
                        {isMenuLoading && !Object.keys(foods).length ? (
                            <div className="text-center p-10">Loading Menu...</div> // Show loading indicator until food is loaded
                        ) : (
                            <div
                                className="flex flex-col md:flex-row justify-between gap-8 lg:gap-12"> {/* Added more gap */}
                                <MenuSection
                                    foods={foods}
                                    onAddToOrder={addToOrder}
                                />
                                <OrderSection
                                    order={order}
                                    error={error && !ordersOpen ? '' : error} // Only show error here if floating island is open or no error exists
                                    start={start}
                                    end={end}
                                    everyXSeconds={EVERY_X_SECONDS}
                                    selectedTimeslot={order.timeslot}
                                    onSetName={setName}
                                    onSetTimeslot={setTimeslot}
                                />
                            </div>
                        )}
                    </div>

                    {!isMenuLoading && (
                        <FloatingOrderSummary
                            order={order}
                            isOpen={ordersOpen}
                            error={error} // Pass error state directly
                            totalItems={totalItems}
                            totalPrice={totalPrice}
                            onToggleOpen={() => openOrders(true)}
                            onRemoveFromOrder={removeFromOrder}
                        />
                    )}
                </>
            ) : (
                <OrderSummary order={order} totalItems={totalItems} totalPrice={totalPrice}
                              onRemoveFromOrder={removeFromOrder} onClose={() => openOrders(false)}/> // Close button
            )}
        </>
    );
};

// Wrap the Page component with the system check HOC
export default WithSystemCheck(Page);
