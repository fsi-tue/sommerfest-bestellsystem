'use client'

import { useEffect, useState } from "react";
import OrderQR from "@/app/components/order/OrderQR.jsx";
import { useRouter } from "next/navigation";
import { getFromLocalStorage } from "@/lib/localStorage";
import { formatDateTime } from "@/lib/time";
import { statusToText } from "@/model/order";


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

	const hasComment = () => {
		return (
			typeof order.comment === "string" &&
			order.comment != "" &&
			order.comment.toLowerCase() !== "No comment".toLowerCase()
		);
	}


    return (
        <div>

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
