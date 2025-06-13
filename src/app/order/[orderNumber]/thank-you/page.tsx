import { Suspense } from 'react';
import ThankYouPage from './thankYouPage';
import { getTranslations } from 'next-intl/server';
import { Loading } from '@/app/components/Loading';

// Server Component that receives params as Promise
export default async function Page({
                                       params,
                                   }: {
    params: Promise<{ orderNumber: string }>
}) {
    // Await params as required by Next.js docs
    const { orderNumber } = await params;
    const t = await getTranslations();

    return (
        <Suspense fallback={<Loading message={t('order_status.suspense.loading')}/>}>
            <ThankYouPage orderNumber={orderNumber}/>
        </Suspense>
    );
}
