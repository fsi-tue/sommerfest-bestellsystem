import { Suspense } from 'react';
import ClientOrderPage from './clientOrderPage';

export default async function Page({
                                       params,
                                   }: {
    params: Promise<{ orderNumber: string }>
}) {
    // Await params as required by Next.js docs
    const { orderNumber } = await params;

    return (
        <Suspense>
            <ClientOrderPage orderId={orderNumber}/>
        </Suspense>
    );
}
