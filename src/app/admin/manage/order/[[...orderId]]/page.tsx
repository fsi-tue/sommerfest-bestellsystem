'use client'

import { useEffect, useRef, useState } from "react";
import { IDetectedBarcode, Scanner } from "@yudiel/react-qr-scanner";
import { getFromLocalStorage } from "@/lib/localStorage";
import WithAuth from "@/app/admin/WithAuth";
import { ORDER_STATES, OrderDocument, OrderStatus } from "@/model/order";
import { FoodDocument } from "@/model/food";
import { formatDateTime } from "@/lib/time";

const Page = ({ params }: { params: { orderId: string } }) => {
    const token = getFromLocalStorage('token', '');

    const [error, setError] = useState('');
    const [orders, setOrders] = useState([] as OrderDocument[]); // state to hold order status
    const [filter, setFilter] = useState(''); // state to hold order status
    const [filteredOrders, setFilteredOrders] = useState([] as OrderDocument[]); // state to hold order status]
    const inputRef = useRef<HTMLInputElement | null>(null);

    // Order states
    const states = ORDER_STATES

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
    }

    // Fetch the order status from the server
    useEffect(() => {
        // Get the order status from the server
        fetch('/api/order/', {
            headers: headers,
        })
            .then(response => response.json())
            .then(data => setOrders(data))
            .catch(error => setError('ErrorMessage fetching orders'));
    }, []);

    // Update the filtered orders when the orders change
    useEffect(() => {
        setFilteredOrders(orders);
    }, [orders]);

    // Set params to filter
    useEffect(() => {
        if (params.orderId) {
            setFilter(params.orderId[0]);
        }
    }, [params.orderId]);

    // Filter the orders
    useEffect(() => {
        if (filter) {
            setFilteredOrders(orders.filter((order: OrderDocument) => {
                if (order.name.toLowerCase().includes(filter.toLowerCase())) {
                    return true;
                }
                if (order._id.toLowerCase().includes(filter.toLowerCase())) {
                    return true;
                }
                if (order.status.toLowerCase().includes(filter.toLowerCase())) {
                    return true;
                }
                return (order.items || []).some((food: FoodDocument) => food.name.toLowerCase().includes(filter.toLowerCase()));
            }));

            // Set input value to filter
            if (inputRef !== null && inputRef.current) {
                inputRef.current.value = filter;
            }
        } else {
            setFilteredOrders(orders);
        }
    }, [filter, orders]);

    /**
     * Function to update the order status
     * @param _id
     * @param status
     */
    const updateOrderStatus = (_id: string, status: OrderStatus) => {
        fetch('/api/order', {
            method: 'PUT',
            headers: headers,
            body: JSON.stringify({ id: _id, status })
        })
            .then(response => response.json())
            .then(() => {
                // Update the order by id
                const newOrders = orders.map((order: OrderDocument) => {
                    if (order._id === _id) {
                        order.status = status;
                    }
                    return order;
                });
                setOrders(newOrders);
            })
            .catch(error => setError('ErrorMessage updating order status'));
    }

    /**
     * Function to convert barcode to order
     * @param barcode
     */
    const barcodeToOrder = (barcode: Array<IDetectedBarcode>) => {
        setError('');
        const linkToOrder = barcode[0].rawValue
        const extractedId = linkToOrder.split('/').pop()
        if (!extractedId) {
            setError('Could not extract order id from barcode');
            return;
        }
        setFilter(extractedId);
    }

    /**
     * Function to search the orders
     * @param e
     */
    const search = (e: any) => {
        setFilter(e.target.value);
    }

    const order_url = function (id: string) {
        return `/api/order/${id}`;
    }

	const hasComment = (order: OrderDocument) => {
		return (
			typeof order.comment === "string" &&
			order.comment != "" &&
			order.comment.toLowerCase() !== "No comment".toLowerCase()
		);
	};

    return (
        <div className="content">
            <div className="p-4">
                <h2 className="text-2xl mb-4">Manage Orders 💸</h2>
                <div className="flex items-center justify-between">
                    <div className="w-1/2">
                        <p className="text-lg">Scan the QR Code to search for an order</p>
                    </div>
                    <div className="w-24 h-24">
                        <Scanner
                            allowMultiple={true} scanDelay={250} paused={false}
                            onScan={(result) => barcodeToOrder(result)}
                        />
                    </div>
                </div>
            </div>

            <input type="text" placeholder="Search by Name, OrderId, State or Pizza"
                className="w-full p-2 border border-gray-300 rounded-lg shadow-md mb-4"
                onChange={search} ref={inputRef} />

            <div className="flex flex-col space-y-4">
                {filteredOrders && filteredOrders.length > 0 && filteredOrders
                    .toSorted((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()) // Sort by date
                    .map((order, index) => ( // Map the orders
                        <div key={order._id + index} className="w-full px-2 py-2">
                            <div className="bg-white border border-gray-300 rounded-lg shadow-md p-4 relative">
                                <a className="text-xs font-light text-gray-500 mb-0"
                                    href={order_url(order._id)}>{order._id}</a>
                                <div className="text-xl font-semibold mb-2">{order.name}</div>
                                <div className="flex gap-1 items-center justify-start">
                                    <span
                                        className="text-xs text-gray-700 mr-2 uppercase tracking-wider mb-2 rounded px-2 py-0.5 bg-gray-200">
                                        {order.status}
                                    </span>
                                    <span
                                        className="text-xs text-gray-700 mr-2 uppercase tracking-wider mb-2 rounded px-2 py-0.5 bg-gray-200">
                                        {order.totalPrice}€
                                    </span>
                                    <span
                                        className="text-xs text-gray-700 mr-2 uppercase tracking-wider mb-2 rounded px-2 py-0.5 bg-gray-200">
                                        {(order.items || []).length} items
                                    </span>

                                    <span
                                        className="text-xs text-gray-700 mr-2 uppercase tracking-wider mb-2 rounded px-2 py-0.5 bg-gray-200">
                                        {formatDateTime(new Date(order.orderDate))}
                                    </span>
                                </div>
                                {hasComment(order) && (
                                    <div className="list-disc list-inside text-sm font-light text-gray-600 mb-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold">Comment:</span>
                                            <span className="pl-4 italic">{order.comment}</span>
                                        </div>
                                    </div>
                                )}
                                <ul className="list-disc list-inside text-sm font-light text-gray-600 mb-4">
                                    {(order.items || []).map(food => (
                                        <li key={food.name}>{food.name}: {food.price}€ ({food.dietary})</li>
                                    ))}
                                </ul>

                                <div className="flex gap-1 items-center justify-start font-light">
                                    {states.map(state => (
                                        <button
                                            disabled={state === order.status} key={state}
                                            style={{ background: order.status === state ? 'green' : 'gray' }}
                                            className={`bg-${state === order.status ? 'green' : 'gray'}-500 hover:bg-${state === order.status ? 'green' : 'gray'}-600 text-white font-bold py-0.5 px-1 rounded`}
                                            onClick={() => updateOrderStatus(order._id, state)}
                                        >
                                            {state}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );
}


export default WithAuth(Page);
