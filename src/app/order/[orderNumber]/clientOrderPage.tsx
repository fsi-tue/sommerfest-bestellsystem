'use client'

import { useEffect, useState } from "react";
import { getDateFromTimeSlot } from "@/lib/time";
import { Order, OrderStatus } from "@/model/order";
import OrderQR from "@/app/components/order/OrderQR";
import { Loading } from "@/app/components/Loading";
import Button from "@/app/components/Button";
import ErrorMessage from "@/app/components/ErrorMessage";
import { useTranslations } from 'next-intl';
import { formatDate } from "date-fns";

export default function ClientOrderPage({ orderNumber }: { orderNumber: string }) {
    const [error, setError] = useState<string | null>(null);
    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const t = useTranslations();


    // Fetch order data
    const fetchOrder = () => {
        fetch(`/api/order/${orderNumber}`)
            .then(async response => {
                const data = await response.json();
                if (!response.ok) {
                    const error = data?.message ?? response.statusText;
                    throw new Error(error);
                }
                return data;
            })
            .then(order => {
                setOrder({ ...order });
                setIsLoading(false);
            })
            .catch(error => {
                setError(error.message || "An error occurred");
                setIsLoading(false);
            });
    }

    useEffect(() => {
        fetchOrder()
    }, [orderNumber]);

    useEffect(() => {
        const interval = setInterval(fetchOrder, 5000);
        return () => clearInterval(interval);
    }, []);

    // Rest of your component logic
    const cancelOrder = () => {
        if (!order) {
            return;
        }

        fetch(`/api/order/${orderNumber}/cancel`, {
            method: 'PUT',
            credentials: 'include',
        })
            .then(response => {
                if (response.ok) {
                    setOrder({
                        ...order,
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

    const hasComment = () => {
        if (!order) {
            return false;
        }

        return (
            typeof order.comment === "string" &&
            order.comment !== "" &&
            order.comment.toLowerCase() !== "no comment"
        );
    };

    const statusToText = (order: { status: OrderStatus }) => {
        switch (order.status) {
            case 'ordered':
                return t('order.status.ordered');
            case 'inPreparation':
                return t('order.status.inPreparation');
            case 'ready':
                return t('order.status.ready');
            case 'delivered':
                return t('order.status.delivered');
            case 'cancelled':
                return t('order.status.cancelled');
            default:
                return t('order.status.default');
        }
    }
    const getStatusColor = (status: OrderStatus) => {
        switch (status) {
            case 'ordered':
                return 'bg-primary-100 text-primary-800';
            case 'inPreparation':
                return 'bg-orange-100 text-orange-800';
            case 'ready':
                return 'bg-green-100 text-green-800';
            case 'delivered':
                return 'bg-gray-100 text-gray-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };


    if (isLoading) {
        return <Loading message="Loading Order..."/>;
    }
    if (!order) {
        return <div className="p-6 text-center"><h1 className="text-xl">{t('order.not_found')}</h1></div>;
    }

    return (
        <div className="p-6 max-w-md mx-auto rounded-2xl bg-white shadow-xl">
            {/* Status Hero Section */}
            <div className="px-6 py-12 text-center">
                <h1 className={`text-2xl px-4 py-2 font-semibold mb-6 text-gray-900 rounded-full max-w-sm mx-auto ${getStatusColor(order.status)}`}>
                    {statusToText(order)}
                </h1>

                {order.status !== 'cancelled' && (
                    <div className="bg-blue-50 rounded-2xl p-6 mb-6 max-w-sm mx-auto">
                        <p className="text-sm text-gray-600 mb-1">{t('order.ready_by')}</p>
                        <p className="text-3xl font-light text-blue-600">
                            {formatDate(getDateFromTimeSlot(order.timeslot), 'HH:mm')}
                        </p>
                        <p className="text-sm text-gray-600">
                            {formatDate(getDateFromTimeSlot(order.timeslot), 'dd.MM.yyyy')}
                        </p>
                    </div>
                )}
            </div>

            <div className="px-6 pb-6">
                <div className="max-w-sm mx-auto space-y-4">

                    <div className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-sm text-gray-500">Order #{orderNumber.slice(-8)}</span>
                            <span className={`text-sm font-medium ${order.isPaid ? 'text-green-600' : 'text-red-600'}`}>
                                {order.isPaid ? t('order.status.paid') : t('order.status.unpaid')}
                            </span>
                        </div>

                        <div className="space-y-3">
                            {order?.items?.map((item, index) => (
                                <div key={index} className="flex justify-between">
                                    <span className="text-gray-900">{item.item.name}</span>
                                    <span className="text-gray-600">€{item.item.price.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between text-lg font-semibold">
                            <span>Total</span>
                            <span>€{order?.items?.reduce((total, item) => total + item.item.price, 0).toFixed(2)}</span>
                        </div>
                    </div>

                    {/* QR Code Card */}
                    <div className="p-6 text-center">
                        <p className="text-sm text-gray-600 mb-4">Show this at pickup</p>
                        <div className="flex justify-center">
                            <OrderQR orderId={orderNumber}/>
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
                            Cancel Order
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
