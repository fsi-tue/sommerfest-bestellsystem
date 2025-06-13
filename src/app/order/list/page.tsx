'use client'

import Timeline from "@/app/components/Timeline";
import { ChevronRight, Clock, Package, Pizza } from "lucide-react";
import { useTranslations } from 'next-intl';
import React, { useCallback, useEffect, useMemo } from "react";
import useOrderStore from "@/app/zustand/order";
import { OrderDocument } from "@/model/order";
import { timeslotToLocalTime } from "@/lib/time";

const Page = () => {
    const { orders } = useOrderStore();
    const t = useTranslations();

    const [simpleOrders, setSimpleOrders] = React.useState<{
        id: string;
        items: string[];
        timeslot: string;
        status: string;
        statusColor: string;
    }[]>([]);

    const statusToColor: { [status: string]: string } = {
        ordered: "primary",
        inPreparation: "orange",
        ready: "green",
        delivered: "gray",
        cancelled: "red"
    }

    // Batch API calls for better performance
    const fetchOrderStatuses = useCallback(async (orderIds: string[]) => {
        try {
            const response = await fetch('/api/order/batch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderIds })
            });

            if (!response.ok) {
                throw new Error('Failed to fetch order statuses');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching order statuses:', error);
            return {};
        }
    }, []);

    useEffect(() => {
        if (orders.length === 0) {
            setSimpleOrders([]);
            return;
        }

        const orderIds = orders.map(order => order._id.toString());

        fetchOrderStatuses(orderIds).then(statusMap => {
            const processedOrders = orders.map((order: OrderDocument) => {
                const orderStatus: string = statusMap[order._id.toString()] ?? 'error'

                return ({
                    id: order._id.toString(),
                    items: order.items.map(item => item.item.name),
                    timeslot: order.timeslot,
                    status: t(`order_status.status.${orderStatus}`),
                    statusColor: statusToColor[orderStatus] ?? 'gray'
                });
            });

            setSimpleOrders(processedOrders);
        });
    }, [orders, fetchOrderStatuses]);

    // Memoize expensive renders
    const ordersList = useMemo(() => {
        if (simpleOrders.length === 0) {
            return (
                <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Package className="w-8 h-8 text-gray-400"/>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {t('order_overview.recent.no_orders_yet')}
                    </h3>
                    <p className="text-gray-500 max-w-sm mx-auto">
                        {t('order_overview.recent.messages.first_order')}
                    </p>
                </div>
            );
        }

        return (
            <div className="divide-y divide-gray-100">
                {simpleOrders.map((order) => (
                    <OrderItem key={`${order.id}-${order.timeslot}`} order={order} t={t}/>
                ))}
            </div>
        );
    }, [simpleOrders, t]);

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                <HeaderSection t={t}/>

                <OrdersSection
                    t={t}
                    ordersCount={simpleOrders.length}
                    ordersList={ordersList}
                />

                <TimelineSection
                    t={t}
                />
            </div>
        </div>
    );
};

// Extract components to prevent re-renders
const HeaderSection = React.memo(({ t }: { t: any }) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <Pizza className="w-4 h-4 text-yellow-500"/>
            </div>
            <h1 className="text-2xl font-semibold text-gray-900">
                {t('order_overview.history.title')}
            </h1>
        </div>
        <p className="text-gray-500 text-sm">
            {t('order_overview.history.subtitle')}
        </p>
    </div>
));

const OrdersSection = React.memo(({ t, ordersCount, ordersList }: any) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">
                {t('order_overview.recent.title')}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
                {t('order_overview.recent.orders_found', { count: ordersCount })}
            </p>
        </div>
        {ordersList}
    </div>
));

const OrderItem = React.memo(({ t, order }: { order: any }) => (
    <a
        href={`/order/${order.id}`}
        className={`block p-6 bg-${order.statusColor}-50 text-${order.statusColor}-800 hover:bg-${order.statusColor}-500 transition-colors group`}
    >
        <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                    <div
                        className="w-10 h-10 rounded-2xl bg-yellow-100 flex items-center justify-center shrink-0">
                        <Pizza className="w-5 h-5 text-yellow-600"/>
                    </div>
                    <div className="min-w-0 flex flex-row items-center gap-3 mb-2">
                        <p className="text-sm font-medium text-gray-900 truncate">
                            {t('order_status.order')} #{order.id.slice(-8)}
                        </p>
                        <p className="items-center px-2 py-1 rounded-md bg-white text-xs text-gray-900 flex gap-1">
                            <Clock className="w-3 h-3"/>
                            {timeslotToLocalTime(order.timeslot)}
                        </p>
                        <p
                            className="inline-flex items-center px-2 py-1 rounded-md bg-white text-xs text-gray-900 font-bold">
                            {order.status}
                        </p>
                    </div>
                </div>
                <div className="ml-13">
                    <div className="flex flex-wrap gap-1 mt-2">
                        {order.items.slice(0, 3).map((item: string, index: number) => (
                            <span
                                key={`${order.id}-${item}-${index}`}
                                className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-xs font-medium text-gray-700"
                            >
                                {item}
                            </span>
                        ))}
                        {order.items.length > 3 && (
                            <span
                                className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-xs font-medium text-gray-500">
                                +{order.items.length - 3} more
                            </span>
                        )}
                    </div>
                </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors shrink-0 ml-4"/>
        </div>
    </a>
));

const TimelineSection = React.memo(({ t }: any) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Clock className="w-4 h-4 text-purple-600"/>
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                    {t('order_overview.timeline.title')}
                </h2>
            </div>
            <p className="text-sm text-gray-500">
                {t('order_overview.timeline.subtitle')}
            </p>
        </div>
        <div className="p-6">
            <Timeline/>
        </div>
    </div>
));

export default Page;
