'use client'

import { useEffect, useState } from "react";
import OrderQR from "@/app/components/order/OrderQR.jsx";
import { useRouter } from "next/navigation";
import { getFromLocalStorage } from "@/lib/localStorage";
import { formatDateTime, getDateFromTimeSlot } from "@/lib/time";


const Page = ({ params }: { params: { orderNumber: string } }) => {
    const [error, setError] = useState(null);
    const [order, setOrder] = useState({} as any);

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
        return (
            typeof order.comment === "string" &&
            order.comment != "" &&
            order.comment.toLowerCase() !== "No comment".toLowerCase()
        );
    }

    const statusToText = (order: { status: string, isPaid: boolean }) => {
        let statusText
        if (order.status === 'ready') {
            statusText = 'Your order is ready for pickup! 🎉';
        } else if (order.status === 'pending') {
            statusText = 'Please pay at the counter.';
        } else if (order.status === 'baking') {
            statusText = 'Your pizza is in the oven. Its getting hot 🔥';
        } else if (order.status === 'delivered') {
            statusText = 'Your order has been delivered.';
        } else if (order.status === 'cancelled') {
            statusText = 'Your order has been cancelled. 😢';
        } else {
            statusText = 'Unknown order.';
        }
        return statusText
    }

    return (
        <div>

            <h2 className="text-2xl">Order Status</h2>

            <a className="text-xs font-light text-gray-500 mb-0"
               href={params.orderNumber}>{params.orderNumber}</a>

            <div className="p-4 flex sm:flex-row flex-col items-start bg-white mt-4">
                <div>
                    <h3 className="text-lg font-bold">QR Code</h3>
                    <OrderQR orderId={params.orderNumber}/>

                    <p className="mb-3 text-lg font-light text-gray-600 leading-7">
                        {statusToText(order)}
                    </p>
                </div>
                <div className="">
                    <div className="ml-4">
                        <h3 className="text-lg font-bold">Order details</h3>
                        {hasComment() && (
                            <div className="list-disc list-inside text-sm font-light text-gray-600 mb-4">
                                <div className="flex flex-col">
                                    <span className="font-bold">Comment:</span>
                                    <span className="pl-4 italic">{order.comment}</span>
                                </div>
                            </div>
                        )}
                        <ul className="list-disc list-inside text-sm font-light text-gray-600 mb-4">
                            {order && order.items && order.items.map((food: any) => (
                                <li key={food.name}>{food.name}: {food.price}€</li>
                            ))}
                        </ul>
                        <p className={`font-light text-gray-600 ${order.isPaid ? 'text-green-600' : 'text-red-600'}`}>
                            Total: {order && order.items && order.items.reduce((total: number, food: {
                            price: number
                        }) => total + food.price, 0)}€ {order.isPaid ? '(Paid)' : '(Not paid)'}
                        </p>
                        <p className="text-lg font-light text-gray-600">
                            Order date: {formatDateTime(new Date(order.orderDate))}
                        </p>
                        <p className="text-lg font-light text-gray-600">
                            Timeslot: {formatDateTime(getDateFromTimeSlot(order.timeslot).toDate())}
                        </p>
                        {order.status !== 'cancelled' &&
													<button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
													        onClick={cancelOrder}>
														Cancel order
													</button>}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Page;
