'use client'

import { getFromLocalStorage } from "@/lib/localStorage";
import Timeline from "@/app/components/Timeline";
import { ChevronRight, Clock, Package, Pizza } from "lucide-react";
import { useTranslations } from 'next-intl';
import { OrderStatus } from "@/model/order";
import React, { useEffect } from "react";

const EVERY_X_SECONDS = 60;

const Page = () => {
    const start = new Date();
    start.setHours(start.getHours() - 1);
    start.setMinutes(0, 0, 0);

    const end = new Date();
    end.setHours(end.getHours() + 1);
    end.setMinutes(59, 59, 999);

    const localStorageOrders = JSON.parse(getFromLocalStorage('localStorageOrders')) ?? []

    const t = useTranslations();

    const [orders, setOrders] = React.useState<{
        id: string;
        items: string[];
        timeslot: string;
        status: OrderStatus;
    }[]>([]);

    useEffect(() => {
        Promise.all(localStorageOrders
            .map(async (order: {
                id: string;
                items: string[];
                timeslot: string;
            }) => {
                // Fetch order data
                const status = await fetch(`/api/order/${order.id}`)
                    .then(async response => {
                        const data = await response.json();
                        if (!response.ok) {
                            const error = data?.message ?? response.statusText;
                            throw new Error(error);
                        }
                        return data.status;
                    })
                    .catch(error => {
                        return 'error'
                    });

                return {
                    ...order,
                    status,
                }
            })).then(r => setOrders(r));
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            <div className="max-w-4xl mx-auto space-y-6">

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                            <Pizza className="w-4 h-4 text-yellow-500"/>
                        </div>
                        <h1 className="text-2xl font-semibold text-gray-900">{t('order_overview.history.title')}</h1>
                    </div>
                    <p className="text-gray-500 text-sm">{t('order_overview.history.subtitle')}</p>
                </div>

                {/* Orders Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-900">{t('order_overview.recent.title')}</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {t('order_overview.recent.orders_found', { count: localStorageOrders.length })}
                        </p>
                    </div>

                    {localStorageOrders.length === 0 ? (
                        <div className="p-12 text-center">
                            <div
                                className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Package className="w-8 h-8 text-gray-400"/>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('order_overview.recent.no_orders_yet')}</h3>
                            <p className="text-gray-500 max-w-sm mx-auto">
                                {t('order_overview.recent.messages.first_order')}
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {orders.map((order) => (
                                <a
                                    key={`${order.id}-${order.timeslot}`}
                                    href={`/order/${order.id}`}
                                    className="block p-6 hover:bg-gray-50 transition-colors duration-200 group"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div
                                                    className="w-10 h-10 bg-yellow-100 rounded-2xl flex items-center justify-center shrink-0">
                                                    <Pizza className="w-5 h-5 text-yellow-600"/>
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                        Order #{order.id.slice(-8)}
                                                    </p>
                                                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                                        <Clock className="w-3 h-3"/>
                                                        {order.timeslot}
                                                    </p>
                                                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                                        {order.status}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="ml-13">
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {(order.items ?? []).slice(0, 3).map((item, itemIndex) => (
                                                        <span
                                                            key={itemIndex}
                                                            className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-xs font-medium text-gray-700"
                                                        >
                                                            {item}
                                                        </span>
                                                    ))}
                                                    {(order.items ?? []).length > 3 && (
                                                        <span
                                                            className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-xs font-medium text-gray-500">
                                                            +{(order.items ?? []).length - 3} more
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <ChevronRight
                                            className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors shrink-0 ml-4"/>
                                    </div>
                                </a>
                            ))}
                        </div>
                    )}
                </div>

                {/* Timeline Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                <Clock className="w-4 h-4 text-purple-600"/>
                            </div>
                            <h2 className="text-lg font-semibold text-gray-900">{t('order_overview.timeline.title')}</h2>
                        </div>
                        <p className="text-sm text-gray-500">
                            {t('order_overview.timeline.subtitle')}
                        </p>
                    </div>

                    <div className="p-6">
                        <Timeline
                            startDate={start}
                            stopDate={end}
                            every_x_seconds={EVERY_X_SECONDS}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Page;
