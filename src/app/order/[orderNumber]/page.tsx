'use client'

import { useEffect, useState } from "react";
import OrderQR from "@/app/components/order/OrderQR.jsx";
import { useRouter } from "next/navigation";
import { getFromLocalStorage } from "@/lib/localStorage";
import { FoodDocument } from "@/model/food";


const Page = ({ params }: { params: { orderNumber: string } }) => {
    const [status, setStatus] = useState('');
    const [foods, setFoods] = useState([] as FoodDocument[]);

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
                setStatus(data.status)
                setFoods(data.items)
            });
    }, [params.orderNumber]);

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

            <div className="flex flex-row items-start p-4 rounded-lg shadow-md">
                <div>
                    <h3 className="text-lg font-bold">QR Code</h3>
                    <OrderQR orderId={params.orderNumber}/>

                    <p className="mb-3 text-lg font-light text-gray-600 leading-7">
                        {statusToText(status)}
                    </p>
                </div>
                <div className="">
                    <div className="ml-4">
                        <h3 className="text-lg font-bold">Order details</h3>
                        <ul className="list-disc list-inside text-sm font-light text-gray-600 mb-4">
                            {foods.map(pizza => (
                                <li key={pizza.name}>{pizza.name}: {pizza.price}€</li>
                            ))}
                        </ul>
                        <p className="text-lg font-light text-gray-600">
                            Total: {foods.reduce((total, pizza) => total + pizza.price, 0)}€
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Page;
