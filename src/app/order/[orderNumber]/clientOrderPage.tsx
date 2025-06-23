'use client'

import { useEffect, useState } from "react";
import { timeslotToLocalTime, timeslotToUTCDate } from "@/lib/time";
import { Order, ORDER_STATUSES, OrderStatus } from "@/model/order";
import OrderQR from "@/app/components/order/OrderQR";
import Button from "@/app/components/Button";
import ErrorMessage from "@/app/components/ErrorMessage";
import { useTranslations } from 'next-intl';
import { formatDate } from "date-fns";
import useOrderStore from "@/app/zustand/order";
import { useQuery } from "@tanstack/react-query";
import { getOrder } from "@/lib/fetch/order";
import { Loading } from "@/app/components/Loading";

export default function ClientOrderPage({ orderId }: { orderId: string }) {
    const [error, setError] = useState<string | null>(null);
    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const { getOrderById } = useOrderStore();

    const t = useTranslations();

    // Fetch order data
    const { data: fetchedOrder, error: orderError, isFetching } = useQuery({
        queryKey: ['order'],
        queryFn: () => getOrder(orderId),
        refetchInterval: 5000
    })

    useEffect(() => {
        if (orderError) {
            setError(orderError.message);
        }
    }, [orderError]);

    useEffect(() => {
        if (isFetching) {
            setIsLoading(isFetching);
        } else {
            setIsLoading(false);
        }
    }, [isFetching]);

    useEffect(() => {
        const orderById = getOrderById(orderId);
        if (orderById) {
            setOrder(orderById);
        }

        if (fetchedOrder && order) {
            setOrder({ ...order, ...{ status: fetchedOrder.status, isPaid: fetchedOrder.isPaid } });
        } else if (fetchedOrder) {
            setOrder(fetchedOrder)
        }

        setIsLoading(false);
    }, [orderId, fetchedOrder]);

    // Rest of your component logic
    const cancelOrder = () => {
        if (!fetchedOrder) {
            return;
        }

        fetch(`/api/order/${orderId}/cancel`, {
            method: 'PUT',
            credentials: 'include',
            body: JSON.stringify({ name: fetchedOrder.name }),
        })
            .then(response => {
                if (response.ok) {
                    setOrder({
                        ...fetchedOrder,
                        status: 'cancelled' as OrderStatus
                    });
                } else {
                    throw new Error("Failed to cancel order");
                }
            })
            .catch(error => {
                setError(error.message);
            });
    };

    const statusToText = (order: {
        status: OrderStatus
    }) => t(`order_status.status.${order.status}`) ?? t('order_status.status.default')
    const getStatusColor = (status: OrderStatus) => {
        switch (status) {
            case ORDER_STATUSES.ORDERED:
                return 'bg-primary-100 text-primary-800';
            case ORDER_STATUSES.ACTIVE:
                return 'bg-orange-100 text-orange-800';
            case ORDER_STATUSES.READY_FOR_PICKUP:
                return 'bg-green-100 text-green-800';
            case ORDER_STATUSES.COMPLETED:
                return 'bg-gray-100 text-gray-800';
            case ORDER_STATUSES.CANCELLED:
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (order === null && isLoading) {
        return <Loading message={t('order_status.suspense.loading')}/>;
    }

    if (!order) {
        return <div className="p-6 text-center"><h1 className="text-xl">{t('order_status.not_found')}</h1></div>;
    }

    return (
        <div className="p-6 max-w-md mx-auto rounded-2xl bg-white shadow-xl">
            <div className="px-6 py-12 text-center">
                <h1 className={`text-2xl px-4 py-2 font-semibold mb-6 text-gray-900 rounded-full max-w-sm mx-auto ${getStatusColor(order.status)}`}>
                    {statusToText(order)}
                </h1>

                {order.status !== 'cancelled' && (
                    <div className="bg-blue-50 rounded-2xl p-6 mb-6 max-w-sm mx-auto">
                        <p className="text-sm text-gray-600 mb-1">{t('order_status.status.ready_by')}</p>
                        <p className="text-3xl font-light text-blue-600">
                            {timeslotToLocalTime(formatDate(timeslotToUTCDate(order.timeslot), 'HH:mm'))}
                        </p>
                        <p className="text-sm text-gray-600">
                            {formatDate(timeslotToUTCDate(order.timeslot), 'dd.MM.yyyy')}
                        </p>
                    </div>
                )}

                <div>
                    {order.name}
                </div>
            </div>

            <div className="px-6 pb-6">
                <div className="max-w-sm mx-auto space-y-4">
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <span
                                className="text-sm text-gray-500">{t('order_status.order')} #{orderId.slice(-8)}</span>
                            <span
                                className={`text-sm font-medium ${order.isPaid ? 'text-green-600' : 'text-red-600'}`}>
                                {order.isPaid ? t('order_status.status.paid') : t('order_status.status.unpaid')}
                            </span>
                        </div>

                        <div className="space-y-3">
                            {order?.items?.map((item, index) => (
                                <div key={`${item._id.toString()}-${index}`} className="flex justify-between">
                                    <span className="text-gray-900">{item.name}</span>
                                    <span className="text-gray-600">€{item.price.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between text-lg font-semibold">
                            <span>{t('order_status.total')}</span>
                            <span>€{order?.items?.reduce((total, item) => total + item.price, 0).toFixed(2)}</span>
                        </div>
                    </div>

                    {/* QR Code Card */}
                    <div className="p-6 text-center">
                        <p className="text-sm text-gray-600 mb-4">{t('order_status.show_at_pickup')}</p>
                        <div className="flex justify-center">
                            <OrderQR orderId={orderId}/>
                        </div>
                    </div>

                    {error && (
                        <div className="p-6 text-center">
                            <ErrorMessage error={error}/>
                        </div>
                    )}

                    {/* Cancel Button */}
                    {order.status !== 'cancelled' && (
                        <Button
                            onClick={cancelOrder}
                            className="w-full py-4 text-red-600 bg-white border border-red-200 rounded-2xl font-medium hover:bg-red-50 transition-colors"
                        >
                            {t('order_status.cancel_order')}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
