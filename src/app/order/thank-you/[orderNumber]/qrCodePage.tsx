'use client'

import OrderQR from "@/app/components/order/OrderQR";
import Link from "next/link";
import { useTranslation } from "react-i18next";

export default function qrCodePage({ orderNumber }: { orderNumber: string }) {
    const [t, i18n] = useTranslation();
    return (
        <div className="bg-white p-8 rounded-2xl shadow-md mb-8">
            <h1 className="text-2xl font-bold mb-4 text-center text-gray-800">{t('order.thank_you.qr.title')}</h1>
            <div className="flex flex-col items-center p-4 rounded-2xl shadow-md">

                <OrderQR orderId={orderNumber} />

                <p className="mb-3 text-lg font-light text-gray-600 leading-7">
                    {t('order.thank_you.qr.your_order_number')}
                    <Link href={`/order/${orderNumber}`}
                        className="font-bold hover:underline">
                        {orderNumber}
                    </Link>
                </p>
                <p className="mb-3 text-lg font-light text-gray-600 leading-7">
                    {t('order.thank_you.qr.instructions')}
                </p>

                <div className="flex space-x-4">
                    <Link href="/"
                        className="bg-primary-950 text-white px-4 py-2 rounded-2xl mt-4 w-full md:w-auto hover:bg-primary-800">
                        {t('order.thank_you.qr.order_again')}
                    </Link>
                    <Link href="/order/list"
                        className="bg-primary-950 text-white px-4 py-2 rounded-2xl mt-4 w-full md:w-auto hover:bg-primary-800">
                        {t('order.thank_you.qr.view_orders')}
                    </Link>
                </div>
            </div>
        </div>
    )
}
