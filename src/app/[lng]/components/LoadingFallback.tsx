"use client";

import { useTranslation } from 'next-i18next';

export default function LoadingFallback() {
    const { t } = useTranslation('translation', { useSuspense: false });

    return (
        <div className="p-6 max-w-md mx-auto">
            <h1 className="text-2xl font-semibold">{t('order.suspense.loading')}</h1>
        </div>
    );
}
