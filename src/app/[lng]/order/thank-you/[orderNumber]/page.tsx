"use client";

import { Suspense } from 'react';
import QRCodePage from './qrCodePage';
import { useT } from "@/app/i18n/i18nClient";

// Server Component that receives params as Promise
export default async function Page({
                                       params,
                                   }: {
    params: Promise<{ orderNumber: string }>
}) {
    // Await params as required by Next.js docs
    const { orderNumber } = await params;
    const { t } = useT();

    return (
        <Suspense fallback={<div className="p-6 max-w-md mx-auto">
            <h1 className="text-2xl font-semibold">{t('order.suspense.loading')}</h1>
        </div>}>
            <QRCodePage orderNumber={orderNumber}/>
        </Suspense>
    );
}
