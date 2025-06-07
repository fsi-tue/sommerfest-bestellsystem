'use client';

import React, { useCallback, useEffect, useMemo, useState, useTransition } from "react"; // Added useCallback, useMemo
import WithSystemCheck from "@/app/WithSystemCheck"; // Keep HOC wrapper
import { ItemDocument } from '@/model/item';

import IntroductionSection from '@/app/components/IntroductionSection';
import MenuSection from '@/app/components/MenuSection';
import OrderSection from '@/app/components/OrderSection';
import FloatingOrderSummary from '@/app/components/FloatingOrderSummary';
import OrderSummary from "@/app/components/order/OrderSummary";
import { useCurrentOrder, useOrderActions } from "@/app/zustand/order";


import "@/lib/i18n";
import { useTranslation } from "react-i18next";

const EVERY_X_SECONDS = 60; // Keep constant here or move to config

const Page: React.FC = () => {
    const [error, setError] = useState('');
    const [items, setItems] = useState<{ [_id: string]: ItemDocument[] }>({});
    const [isMenuLoading, setIsMenuLoading] = useState(true); // Add loading state for menu
    const [ordersOpen, openOrders] = useState(false);
    const [t, i18n] = useTranslation();

    const order = useCurrentOrder()
    const orderActions = useOrderActions()

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
                setItems(data);
            })
            .catch(error => {
                const msg = t('errors.failed_to_load_menu',{message:error.message});
                console.error(msg, error);
                setError(msg); // Provide more context
            })
            .finally(() => {
                setIsMenuLoading(false);
            });
    }, []);

    // --- State Update Handlers (Memoized) ---
    const clearError = useCallback(() => {
        setError('');
    }, []);

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
                        className="bg-white p-6 md:p-8 rounded-2xl shadow-md mb-24"> {/* Increased bottom margin for floating island */}
                        {isMenuLoading && !Object.keys(items).length ? (
                            <div className="text-center p-10">{t('loading_menu')}</div> // Show loading indicator until item is loaded
                        ) : (
                            <div
                                className="flex flex-col md:flex-row justify-between gap-8 lg:gap-12"> {/* Added more gap */}
                                <MenuSection
                                    items={items}
                                    onAddToOrder={orderActions.addToOrder}
                                />
                                <OrderSection
                                    error={error && !ordersOpen ? '' : error}
                                    start={start}
                                    end={end}
                                    every_x_seconds={EVERY_X_SECONDS}
                                />
                            </div>
                        )}
                    </div>

                    {!isMenuLoading && (
                        <FloatingOrderSummary
                            isOpen={ordersOpen}
                            error={error}
                            onToggleOpen={() => openOrders(true)}
                        />
                    )}
                </>
            ) : (
                <OrderSummary onClose={() => openOrders(false)}/> // Close button
            )}
        </>
    );
};

// Wrap the Page component with the system check HOC
export default WithSystemCheck(Page);
