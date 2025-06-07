'use client';

import React, { useEffect, useState } from "react"; // Added useCallback, useMemo
import WithSystemCheck from "@/app/WithSystemCheck"; // Keep HOC wrapper
import { ItemDocument } from '@/model/item';

import IntroductionSection from '@/app/components/IntroductionSection';
import MenuSection from '@/app/components/order/MenuSection';
import FloatingOrderSummary from '@/app/components/order/FloatingOrderSummary';
import OrderSummary from "@/app/components/order/OrderSummary";

import { useTranslations } from 'next-intl';

const Page: React.FC = () => {
    const [error, setError] = useState('');
    const [items, setItems] = useState<{ [_id: string]: ItemDocument[] }>({});
    const [isMenuLoading, setIsMenuLoading] = useState(true); // Add loading state for menu
    const [ordersOpen, setOrdersOpen] = useState(false);
    const t = useTranslations();

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
                const msg = t('errors.failed_to_load_menu', { message: error.message });
                console.error(msg, error);
                setError(msg); // Provide more context
            })
            .finally(() => {
                setIsMenuLoading(false);
            });
    }, []);


    // --- Render ---
    return (
        // Using a fragment as the outer div is provided by layout.tsx
        <div>
            {!ordersOpen ? (
                <div className="max-w-4xl mx-auto space-y-6">
                    <IntroductionSection/>

                    <div
                        className="bg-white p-6 md:p-8 rounded-2xl shadow-md mb-24">
                        {isMenuLoading && !Object.keys(items).length ? (
                            <div className="text-center p-10">{t('loading_menu')}</div> // Show loading indicator until item is loaded
                        ) : (
                            <div
                                className="flex flex-col md:flex-row justify-between">
                                <MenuSection
                                    items={items}
                                />
                            </div>
                        )}
                    </div>

                    {!isMenuLoading && (
                        <FloatingOrderSummary
                            error={error}
                            onToggleOpen={() => setOrdersOpen(true)}
                        />
                    )}
                </div>
            ) : (
                <OrderSummary onClose={() => setOrdersOpen(false)}/>
            )}
        </div>
    );
};

// Wrap the Page component with the system check HOC
export default WithSystemCheck(Page);
