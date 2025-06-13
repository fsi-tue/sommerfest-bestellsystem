import { Suspense } from 'react';
import ClientOrderPage from './clientOrderPage';
import { Loading } from '@/app/components/Loading';

export default async function Page({
                                       params,
                                   }: {
    params: Promise<{ orderNumber: string }>
}) {
    // Await params as required by Next.js docs
    const { orderNumber } = await params;

    return (
        <Suspense fallback={<Loading/>}>
            <ClientOrderPage orderNumber={orderNumber}/>
        </Suspense>
    );
}
