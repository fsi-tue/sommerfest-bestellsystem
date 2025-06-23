'use client';

import React, { useState } from "react"; // Added useCallback, useMemo
import WithSystemCheck from "@/app/WithSystemCheck"; // Keep HOC wrapper
import IntroductionSection from '@/app/components/order/IntroductionSection';
import MenuSection from '@/app/components/order/MenuSection';
import FloatingOrderSummary from '@/app/components/order/FloatingOrderSummary';
import OrderSummary from "@/app/components/order/OrderSummary";

import { useTranslations } from 'next-intl';
import { useItems } from "@/lib/fetch/item";
import { Loading } from "@/app/components/Loading";
import ErrorMessage from "@/app/components/ErrorMessage";

const Page: React.FC = () => {
    const [ordersOpen, setOrdersOpen] = useState(false);
    const t = useTranslations();

    const { data, error, isFetching } = useItems()

    if (isFetching) {
        return <Loading message={t('loading_menu')}/>
    }

    if (error) {
        return <ErrorMessage error={error.message}/>;
    }

    if (!data) {
        return null;
    }

    if (!ordersOpen) {
        return (
            <div className="max-w-4xl mx-auto space-y-6">
                <IntroductionSection/>

                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-md mb-24">
                    <div
                        className="flex flex-col md:flex-row justify-between">
                        <MenuSection
                            items={data}
                        />
                    </div>
                </div>

                <FloatingOrderSummary
                    onToggleAction={() => setOrdersOpen(true)}
                />
            </div>
        )
    } else {
        return <OrderSummary onClose={() => setOrdersOpen(false)}/>
    }
};

export default WithSystemCheck(Page);
