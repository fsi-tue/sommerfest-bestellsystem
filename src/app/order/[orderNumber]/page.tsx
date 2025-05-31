import { Suspense } from 'react';
import ClientOrderPage from './clientOrderPage';
import { useTranslation } from 'react-i18next';

// Server Component that receives params as Promise
export default async function Page({
                                       params,
                                   }: {
    params: Promise<{ orderNumber: string }>
}) {
    // Await params as required by Next.js docs
    const { orderNumber } = await params;
    const [t, i18n] = useTranslation();

    return (
        <Suspense fallback={<div className="p-6 max-w-md mx-auto">
            <h1 className="text-2xl font-semibold">{t('order.suspense.loading')}</h1>
        </div>}>
            <ClientOrderPage orderNumber={orderNumber}/>
        </Suspense>
    );
}
