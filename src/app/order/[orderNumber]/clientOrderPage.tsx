'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getFromLocalStorage } from "@/lib/localStorage";
import { formatDateTime, getDateFromTimeSlot } from "@/lib/time";
import { Order, OrderStatus } from "@/model/order";
import OrderQR from "@/app/components/order/OrderQR";

// Client Component with the original logic
export default function ClientOrderPage({ orderNumber }: { orderNumber: string }) {
    const [error, setError] = useState<string | null>(null);
    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const router = useRouter();

    // Check if logged in
    useEffect(() => {
        const token = getFromLocalStorage('token');
        if (token) {
            router.push(`/admin/manage/order/${orderNumber}`);
        }
    }, [orderNumber, router]);

    // Fetch order data
    useEffect(() => {
        fetch(`/api/order/${orderNumber}`)
            .then(async response => {
                const data = await response.json();
                if (!response.ok) {
                    const error = (data && data.message) || response.statusText;
                    throw new Error(error);
                }
                return data;
            })
            .then(data => {
                setOrder(data);
                setIsLoading(false);
            })
            .catch(error => {
                setError(error.message || "An error occurred");
                setIsLoading(false);
            });
    }, [orderNumber]);

    // Rest of your component logic
    const cancelOrder = () => {
        if (!order) return;

        fetch(`/api/order/${orderNumber}/cancel`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' }
        })
            .then(response => {
                if (response.ok) {
                    setOrder({ ...order, status: 'cancelled' });
                } else {
                    throw new Error("Failed to cancel order");
                }
            })
            .catch(error => {
                setError(error.message);
            });
    };

    const hasComment = () => {
        if (!order) return false;

        return (
            typeof order.comment === "string" &&
            order.comment !== "" &&
            order.comment.toLowerCase() !== "no comment"
        );
    };

    const statusToText = (order: { status: OrderStatus }) => {
        switch (order.status) {
            case 'ordered': return 'We\'ve received your order.';
            case 'inPreparation': return 'Your order is being prepared.';
            case 'ready': return 'Your order is ready for pickup!';
            case 'delivered': return 'Your order has been delivered.';
            case 'cancelled': return 'Your order has been cancelled.';
            default: return 'Order status unavailable.';
        }
    };

    if (isLoading) {
        return (
            <div className="p-6 max-w-md mx-auto">
                <h1 className="text-2xl font-semibold">Loading...</h1>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 max-w-md mx-auto">
                <h1 className="text-2xl font-semibold text-red-600">Error</h1>
                <p>{error}</p>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="p-6 max-w-md mx-auto">
                <h1 className="text-2xl font-semibold">Order not found</h1>
            </div>
        );
    }

    // Return your original JSX
    return (
        <div className="p-6 max-w-md md:max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                    <span className="w-12 h-12 rounded-full mr-3 bg-white flex items-center justify-center">
                        🍕
                    </span>
                    <div>
                        <h2 className="text-2xl font-semibold">Order Status</h2>
                        <p className="text-sm text-gray-500">Ordered {formatDateTime(new Date(order.orderDate))}</p>
                    </div>
                </div>
                <div className="flex justify-center items-center">
                    <OrderQR orderId={orderNumber}/>
                </div>
            </div>

            {/* Rest of your UI */}
            <div className="bg-white p-4 rounded-lg mb-4">
                <h3 className="text-lg font-light">{statusToText(order)}</h3>
                {order.status !== 'cancelled' && (
                    <>
                        <h3 className="text-xl font-semibold mb-2">Arriving {formatDateTime(getDateFromTimeSlot(order.timeslot).toDate())}</h3>
                        <div className="bg-green-200 h-2 rounded-full mb-2 relative overflow-hidden">
                            <div className="bg-green-500 h-full rounded-full w-1/2"></div>
                        </div>
                    </>
                )}
                <p className="text-sm text-gray-700">Ship to: {order.name}</p>

                {order?.items?.map((item, index) => (
                    <div key={`${item.food._id?.toString() || index}`}>
                        <div className="mt-2 border-b border-gray-200 last:border-b-0"/>
                        <div className="py-4 flex items-center space-x-4">
                            <div>
                                <h3 className="text-lg font-semibold">{item.food.name}</h3>
                                <div className="flex space-x-2">
                                    {item.food.dietary && (
                                        <span className="text-xs text-gray-500 font-light rounded-2xl border border-gray-100 px-2">
                                            {item.food.dietary}
                                        </span>
                                    )}
                                    <span className="text-xs text-gray-500 font-light rounded-2xl border border-gray-100 px-2">
                                        {item.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white p-4 rounded-lg mb-4">
                <h3 className="text-xl font-semibold mb-2">Details</h3>
                <div className="flex justify-between text-sm text-gray-700 mb-2">
                    <span>Order Number</span>
                    <span>{orderNumber}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-700 mt-2">
                    <span>Total</span>
                    <span>{order?.items?.reduce((total, item) => total + item.food.price, 0).toFixed(2)}€</span>
                </div>
                <div className="flex justify-between text-sm text-gray-700 mt-2">
                    <span>Payment Status</span>
                    <span className={order.isPaid ? 'text-green-500' : 'text-red-500'}>
                        {order.isPaid ? 'Paid' : 'Unpaid'}
                    </span>
                </div>
            </div>

            {order.status !== 'cancelled' && (
                <button
                    className="block w-full text-center text-blue-600 text-lg py-2 border border-blue-600 rounded hover:bg-blue-50"
                    onClick={cancelOrder}
                >
                    Cancel Order
                </button>
            )}
        </div>
    );
}
