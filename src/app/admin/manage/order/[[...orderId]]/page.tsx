'use client'

import { useEffect, useRef, useState } from "react";
import { IDetectedBarcode, Scanner } from "@yudiel/react-qr-scanner";
import { getFromLocalStorage } from "@/lib/localStorage";
import WithAuth from "@/app/admin/WithAuth";
import { ORDER_STATES, OrderDocument, OrderStatus } from "@/model/order";
import { FoodDocument } from "@/model/food";
import { formatDateTime } from "@/lib/time";
import SearchInput from "@/app/components/SearchInput";

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
        <div>
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

            <SearchInput search={setFilter} searchValue={filter}/>

            <div className="flex flex-col space-y-4">
                {filteredOrders && filteredOrders.length > 0 && filteredOrders
                    .toSorted((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()) // Sort by date
                    .map((order, index) => ( // Map the orders
                        <div key={order._id + index} className="w-full px-4 py-4 bg-white rounded-lg shadow-sm">
                            <div className="mb-4 p-4 bg-white rounded-lg shadow-sm">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-lg font-semibold text-gray-800">{order.name}</span>
                                    <a className="text-xs font-light text-gray-500" href={order_url(order._id)}>
                                        {order._id}
                                    </a>
                                </div>

                                <div className="mb-2 grid grid-cols-1 gap-1 text-sm text-gray-700">
                                    <div className="flex justify-between">
                                        <span className="font-medium">Status:</span>
                                        <span>{order.status}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-medium">Price:</span>
                                        <span>{order.totalPrice}€</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-medium">Items:</span>
                                        <span>{order.items.length}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-medium">Order Date:</span>
                                        <span>{formatDateTime(new Date(order.orderDate))}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-medium">Timeslot:</span>
                                        <span>{formatDateTime(new Date(order.timeslot))}</span>
                                    </div>
                                </div>
                            </div>

                            {order.comment && (
                                <div className="mb-4">
                                    <div className="text-sm font-light text-gray-600">
                                        <span className="font-bold">Comment:</span>
                                        <span className="pl-4 italic">{order.comment}</span>
                                    </div>
                                </div>
                            )}

                            <ul className="list-none text-sm font-light text-gray-600 mb-4">
                                {order.items.map((food, index) => (
                                    <li key={index}
                                        className="flex justify-between items-center mb-2 p-2 bg-white rounded-md shadow-sm hover:shadow-md transition-shadow duration-200">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-gray-800">{food.name}</span>
                                            <div className="flex gap-1 mt-1">
                                                    <span
                                                        className="px-2 py-0.5 text-xs font-semibold text-white bg-blue-500 rounded-full">{food.dietary}</span>
                                                <span
                                                    className="px-2 py-0.5 text-xs font-semibold text-white bg-green-500 rounded-full">{food.type}</span>
                                            </div>
                                        </div>
                                        <span className="text-sm font-semibold text-gray-800">{food.price}€</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="flex gap-2 flex-wrap justify-start">
                                {states.map(state => (
                                    <button
                                        key={state}
                                        disabled={state === order.status}
                                        className={`rounded-full px-4 py-2 text-sm font-medium transition duration-200 ${state === order.status ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed`}
                                        onClick={() => updateOrderStatus(order._id, state)}
                                    >
                                        {state}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );
}


export default WithAuth(Page);
