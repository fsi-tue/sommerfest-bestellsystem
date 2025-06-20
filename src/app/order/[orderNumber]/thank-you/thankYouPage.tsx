'use client'

import OrderQR from "@/app/components/order/OrderQR";
import { useTranslations } from 'next-intl';

export default function ThankYouPage({ orderNumber }: { orderNumber: string }) {
    const t = useTranslations();
    return (
        <div className="p-6 max-w-md mx-auto rounded-2xl bg-white shadow-xl">
            <div className="px-6 py-12 text-center">
                <h1 className="text-2xl font-bold mb-4 text-center text-gray-800">{t('order_status.thank_you.qr.title')}</h1>
                <div className="flex flex-col items-center">

                    <OrderQR orderId={orderNumber}/>

                    <p className="mb-3 text-lg font-light text-gray-600 leading-7">
                        {t('order_status.thank_you.qr.your_order_number')}
                        <a href={`/order/${orderNumber}`}
                           className="font-bold hover:underline">
                            {orderNumber}
                        </a>
                    </p>
                    <p className="mb-3 text-lg font-light text-gray-600 leading-7">
                        {t('order_status.thank_you.qr.instructions')}
                    </p>

                    <div className="flex space-x-4">
                        <a href={`/`}
                           className="bg-primary-950 text-white px-4 py-2 rounded-2xl mt-4 w-full md:w-auto hover:bg-primary-800">
                            {t('order_status.thank_you.qr.order_again')}
                        </a>
                        <a href={`/order/list`}
                           className="bg-primary-950 text-white px-4 py-2 rounded-2xl mt-4 w-full md:w-auto hover:bg-primary-800">
                            {t('order_status.thank_you.qr.view_orders')}
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}
