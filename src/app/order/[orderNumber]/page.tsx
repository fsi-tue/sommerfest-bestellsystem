import { Suspense } from 'react';
import ClientOrderPage from './clientOrderPage';
import LoadingFallback from '@/app/components/LoadingFallback';

// Remove "use client" - this should be a server component
export default async function Page({
                                       params,
                                   }: {
    params: Promise<{ orderNumber: string }>
}) {
    // Await params as required by Next.js docs
    const { orderNumber } = await params;

    return (
        <Suspense fallback={<LoadingFallback/>}>
            <ClientOrderPage orderNumber={orderNumber}/>
        </Suspense>
    );
}
