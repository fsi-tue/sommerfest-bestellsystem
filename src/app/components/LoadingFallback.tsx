"use client";

import { useTranslations } from "next-intl";


export default function LoadingFallback() {
    const t = useTranslations();

    return (
        <div className="p-6 max-w-md mx-auto">
            <h1 className="text-2xl font-semibold">{t('order.suspense.loading')}</h1>
        </div>
    );
}
