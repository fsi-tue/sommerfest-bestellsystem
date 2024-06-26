'use client'

import { useEffect, useState } from "react";
import OrderQR from "@/app/components/order/OrderQR.jsx";
import { useRouter } from "next/navigation";
import { getFromLocalStorage } from "@/lib/localStorage";
import { formatDateTime } from "@/lib/time";


const Page = ({ params }: { params: { orderNumber: string } }) => {
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
            .then(response => response.json())
            .then(data => {
                setOrder(data)
            });
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
        });
    }

    const statusToText = (status: string) => {
        if (status === 'ready') {
            return 'Your order is ready for pickup!';
        } else if (status === 'pending') {
            return 'Please pay at the counter.';
        } else if (status === 'paid') {
            return 'Your order is being prepared...';
        } else if (status === 'delivered') {
            return 'Your order has been delivered!';
        } else if (status === 'cancelled') {
            return 'Your order has been cancelled.';
        } else {
            return 'Unknown status';
        }
    }

    return (
        <div className="content">

            <h2 className="text-2xl">Order Status</h2>

            <a className="text-xs font-light text-gray-500 mb-0"
               href={params.orderNumber}>{params.orderNumber}</a>

            <div className="p-4 rounded-lg shadow-md flex sm:flex-row flex-col items-start bg-white mt-4">
                <div>
                    <h3 className="text-lg font-bold">QR Code</h3>
                    <OrderQR orderId={params.orderNumber}/>

                    <p className="mb-3 text-lg font-light text-gray-600 leading-7">
                        {statusToText(order.status)}
                    </p>
                </div>
                <div className="">
                    <div className="ml-4">
                        <h3 className="text-lg font-bold">Order details</h3>
                        <ul className="list-disc list-inside text-sm font-light text-gray-600 mb-4">
                            {order && order.items && order.items.map((food: any) => (
                                <li key={food.name}>{food.name}: {food.price}€</li>
                            ))}
                        </ul>
                        <p className="text-lg font-light text-gray-600">
                            Total: {order && order.items && order.items.reduce((total: number, food: {
                            price: number
                        }) => total + food.price, 0)}€
                        </p>
                        <p className="text-lg font-light text-gray-600">
                            Order date: {formatDateTime(new Date(order.orderDate))}
                        </p>
                        <p className="text-lg font-light text-gray-600">
                            Timeslot: {formatDateTime(new Date(order.timeslot))}
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
