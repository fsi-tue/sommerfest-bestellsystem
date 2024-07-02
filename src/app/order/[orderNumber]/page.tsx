'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getFromLocalStorage } from "@/lib/localStorage";
import { formatDateTime, getDateFromTimeSlot } from "@/lib/time";
import { OrderStatus, OrderWithId } from "@/model/order";
import OrderQR from "@/app/components/order/OrderQR";


const Page = ({ params }: { params: { orderNumber: string } }) => {
    const [error, setError] = useState(null);
    const [order, setOrder] = useState<OrderWithId | null>(null)

    // Check if logged in
    const router = useRouter();
    useEffect(() => {
        const token = getFromLocalStorage('token');
        if (token) {
            router.push(`/admin/manage/order/${params.orderNumber}`);
        }
    }, []);


    useEffect(() => {
        // Get the order status from the server
        fetch(`/api/order/${params.orderNumber}`)
            .then(async response => {
                const data = await response.json();
                if (!response.ok) {
                    const error = (data && data.message) || response.statusText;
                    throw new Error(error);
                }
                return data;
            })
            .then(data => {
                setOrder(data)
            })
            .catch(error => {
                setError(error);
            })
    }, [params.orderNumber]);

    const cancelOrder = () => {
        if (!order) {
            return;
        }

        fetch(`/api/order/${params.orderNumber}/cancel`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            }
        }).then(response => {
            if (response.ok) {
                setOrder({ ...order, status: 'cancelled' });
            }
        }).catch(error => {
            setError(error);
        })
    }

    const hasComment = () => {
        if (!order) {
            return false;
        }

        return (
            typeof order.comment === "string" &&
            order.comment != "" &&
            order.comment.toLowerCase() !== "No comment".toLowerCase()
        );
    }

    const statusToText = (order: { status: OrderStatus }) => {
        let statusText;
        switch (order.status) {
            case 'ordered':
                statusText = 'We\'ve received your order.';
                break;
            case 'inPreparation':
                statusText = 'Your order is being prepared.';
                break;
            case 'ready':
                statusText = 'Your order is ready for pickup!';
                break;
            case 'delivered':
                statusText = 'Your order has been delivered.';
                break;
            case 'cancelled':
                statusText = 'Your order has been cancelled.';
                break;
            default:
                statusText = 'Order status unavailable.';
                break;
        }
        return statusText;
    }


    if (!order) {
        return (
            <div className="p-6 max-w-md mx-auto">
                <h1 className="text-2xl font-semibold">Loading...</h1>
            </div>
        )
    }

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
                    <OrderQR orderId={params.orderNumber}/>
                </div>
            </div>

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

                {order?.items?.map((item) => (
                    <>
                        <div className="mt-2 border-b border-gray-200 last:border-b-0"/>
                        <div className="py-4 flex items-center space-x-4" key={item.food._id}>
                            {/* <img src="https://via.placeholder.com/50" alt="Product Image"
                             className="w-16 h-16 mr-4 rounded-lg"/> */}
                            <div>
                                <h3 className="text-lg font-semibold">{item.food.name}</h3>
                                <div className="flex space-x-2">
                                    {item.food.dietary && (<span
                                        className="text-xs text-gray-500 font-light rounded-2xl border border-gray-100 px-2">{item.food.dietary}</span>
                                    )}
                                    <span
                                        className="text-xs text-gray-500 font-light rounded-2xl border border-gray-100 px-2">{item.status}</span>
                                </div>
                            </div>
                        </div>
                    </>
                ))}
            </div>

            <div className="bg-white p-4 rounded-lg mb-4">
                <h3 className="text-xl font-semibold mb-2">Details</h3>
                <div className="flex justify-between text-sm text-gray-700 mb-2">
                    <span>Order Number</span>
                    <span>{params.orderNumber}</span>
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
                <button className="block text-center text-blue-600 text-lg" onClick={cancelOrder}>
                    Cancel Order
                </button>)}
        </div>
    );
}

export default Page;
