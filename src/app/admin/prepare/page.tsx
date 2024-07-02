'use client'

import { useEffect, useState } from "react";
import { getFromLocalStorage } from "@/lib/localStorage";
import ErrorMessage from "@/app/components/ErrorMessage.jsx";
import { getDateFromTimeSlot } from "@/lib/time";
import { ItemStatus, Order, OrderWithId } from "@/model/order";
import WithAuth from "@/app/admin/WithAuth";
import SearchInput from "@/app/components/SearchInput";
import './Prepare.css';


const Page = () => {
    const [error, setError] = useState('');

    const [filter, setFilter] = useState('')
    const [orders, setOrders] = useState<OrderWithId[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<OrderWithId[]>([]);
    const [ordersByTimeslot, setOrdersByTimeslot] = useState(new Map<string, OrderWithId[]>)

    const [currentTime, setCurrentTime] = useState(new Date());
    const [isClient, setIsClient] = useState(false);

    const token = getFromLocalStorage('token', '');
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
    }

    useEffect(() => {
        setIsClient(true);
    }, []);

    const getOrders = () => {
        console.log('Fetching orders')
        fetch('/api/order', { headers })
            .then(async response => {
                const data = await response.json();
                if (!response.ok) {
                    const error = (data && data.message) || response.statusText;
                    throw new Error(error);
                }
                console.log('Orders', data)
                setOrders(data);
            })
            .catch(error => setError(error.message));

        setTimeout(() => {
            getOrders();
        }, 5000);
    }

    useEffect(() => {
        if (isClient) {
            getOrders();
        }
    }, [isClient]);

    // Filter the orders
    useEffect(() => {
        if (filter) {
            setFilteredOrders(orders.filter((order: OrderWithId) =>
                order.name.toLowerCase().includes(filter.toLowerCase()) ||
                order._id.toLowerCase().includes(filter.toLowerCase()) ||
                order.status.toLowerCase().includes(filter.toLowerCase()) ||
                order.totalPrice.toString().includes(filter) ||
                order.timeslot.includes(filter) ||
                (order.items || []).some((item) => item.food.name.toLowerCase().includes(filter.toLowerCase()))));
        } else {
            setFilteredOrders(orders);
        }
    }, [filter, orders]);

    useEffect(() => {
        const ordersByTimeslot = new Map<string, OrderWithId[]>
        filteredOrders.forEach(order => {
            const timeslot = order.timeslot
            // Add order to list at the respective timeslot
            const ordersAtTimeslot = ordersByTimeslot.get(timeslot)
            if (!ordersAtTimeslot) {
                ordersByTimeslot.set(timeslot, [order])
            } else {
                ordersByTimeslot.set(timeslot, [...ordersAtTimeslot, order])
            }
        })

        // Sort timeslots
        const sortedOrdersByTimeslots = new Map(
            Array
                .from(ordersByTimeslot)
                .toSorted((a, b) => getDateFromTimeSlot(a[0]).toDate().getTime() - getDateFromTimeSlot(b[0]).toDate().getTime())
        )

        setOrdersByTimeslot(sortedOrdersByTimeslots)
    }, [filteredOrders])

    const setFoodStatusFromLocalStorage = (orders: OrderWithId[]) => {
        // Get from local storage
        orders.map(order => {
            let foodItems = getFromLocalStorage(`foodItems.${order._id}`, []);
            if (!foodItems || foodItems.length === 0) {
                return;
            }
            foodItems = JSON.parse(foodItems);

            const newOrder = { ...order };
            newOrder.items = newOrder.items.map((item, index) => {
                const foodItem = foodItems[index];
                if (foodItem && foodItem.status) {
                    item.status = foodItem.status;
                }
                return item;
            })

            return newOrder;
        })
    }

    /**
     * Function to update the order status
     * @param _id
     * @param itemIndex
     * @param status
     */
    const updateItemStatus = (_id: string, itemIndex: number, status: ItemStatus) => {
        const order = orders.find(order => order._id === _id);
        if (!order) {
            console.error('Order not found');
            return;
        }

        const newOrder = { ...order };
        newOrder.items[itemIndex].status = status;
        console.log('Updating item status', newOrder)

        fetch('/api/order', {
            method: 'PUT',
            headers: headers,
            body: JSON.stringify({ id: _id, order: newOrder })
        })
            .then(async response => {
                const data = await response.json();
                if (!response.ok) {
                    const error = (data && data.message) || response.statusText;
                    throw new Error(error);
                }
                return data;
            })
            .then(() => {
                // Update the order by id
                setOrders(orders.map(order => order._id === _id ? newOrder : order));
            })
            .catch(error => setError(error.message));
    };

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer); // Cleanup timer on component unmount
    }, []);

    /**
     * Check if the order has a comment
     * @param order
     */
    const hasComment = (order: Order) => {
        return (
            typeof order.comment === "string" &&
            order.comment != "" &&
            order.comment.toLowerCase() !== "No comment".toLowerCase()
        );
    };

    return (
        <div>
            <div className="md:p-4 pb-1">
                <h2 className="text-2xl mb-4">Orders</h2>
                <h4 className="mb-2">Current Time: {currentTime.toLocaleTimeString()}</h4>
            </div>

            <div className="md:p-4 py-1">
                <h3>
                    Open
                    orders: {[''].map(() => {
                    const openOrders = orders
                        .flatMap(order => order.items)
                        .reduce((number, item) => number + (['prepping'].includes(item.status) ? 1 : 0), 0)

                    return openOrders > 0 ? openOrders : 'No open orders 🎉'
                })
                }
                </h3>

                {error && <ErrorMessage error={error}/>}
                <SearchInput search={setFilter} searchValue={filter}/>

                <div className="flex flex-col space-y-2">
                    <table className="min-w-full bg-white overflow-hidden item-table rounded-lg shadow-md">
                        <thead className="bg-gray-200">
                        <tr>
                            <th className="px-4 py-2 text-left text-xs md:text-sm font-medium text-gray-600 uppercase tracking-wider w-1/2">Item</th>
                            <th className="px-4 py-2 text-left text-xs md:text-sm font-medium text-gray-600 uppercase tracking-wider w-1/6">Timeslot</th>
                            <th className="px-4 py-2 text-left text-xs md:text-sm font-medium text-gray-600 uppercase tracking-wider hidden sm:block">Name</th>
                            <th className="px-4 py-2 text-left text-xs md:text-sm font-medium text-gray-600 uppercase tracking-wider w-1/6">Status</th>
                        </tr>
                        </thead>
                        <tbody>
                        {ordersByTimeslot && Array.from(ordersByTimeslot)
                            // .toSorted((a, b) => getDateFromTimeSlot(a[0]).toDate().getTime() - getDateFromTimeSlot(b[0]).toDate().getTime()) // Sort by date
                            .map((timeslot, timeslotIndex) => (
                                <>
                                    {timeslot[1] && timeslot[1].map(((order, orderIndex) => (
                                        <>
                                            {order.items && order.items.map(((item, itemIndex) => {
                                                    const time = new Date().getTime()
                                                    const tooLate = getDateFromTimeSlot(timeslot[0]).toDate().getTime() < time && !['readyToCook', 'cancelled', 'delivered'].includes(item.status)

                                                    const previousTimeslot = (Array.from(ordersByTimeslot)[timeslotIndex - 1] ?? [''])[0]
                                                    const previousTimeslotTime = getDateFromTimeSlot(previousTimeslot).toDate().getTime()

                                                    const timeslotTime = getDateFromTimeSlot(timeslot[0]).toDate().getTime()

                                                    const nextTimeslot = (Array.from(ordersByTimeslot)[timeslotIndex + 1] ?? [''])[0]
                                                    const nextTimeslotTime = getDateFromTimeSlot(nextTimeslot).toDate().getTime()

                                                    const isTimeslotActive = (previousTimeslotTime < time || previousTimeslot === '') &&
                                                        time <= timeslotTime &&
                                                        (time <= nextTimeslotTime || nextTimeslot === '')

                                                    return (
                                                        <>
                                                            {hasComment(order) && (<tr className="text-sm italic comment"
                                                                                       key={`${order._id}-${item.food.name}-${orderIndex}-${itemIndex}-comment`}>
                                                                <td className="px-4 py-2 text-xs md:text-sm font-medium text-gray-900 w-1/2">{order.comment}</td>
                                                            </tr>)}
                                                            <tr key={`${order._id}-${item.food.name}-${orderIndex}-${itemIndex}`}
                                                                className={`border-t border-gray-200
                                                            ${isTimeslotActive ? 'border border-gray-500' : ''}
                                                            ${tooLate ? 'bg-red-100 text-red-600' : 'text-gray-900'}
                                                            ${['readyToCook', 'cancelled', 'delivered'].includes(item.status) ? 'bg-green-100 text-green-600' : ''}
                                                            ${['cancelled', 'delivered'].includes(order.status) ? 'bg-gray-100 text-gray-600 select-none cursor-not-allowed opacity-10' : ''}
                                                            `}>
                                                                <td className="px-4 py-2 text-xs md:text-sm font-medium text-gray-900 w-1/2">
                                                                    {item.food.name}
                                                                    <div className="flex gap-1 mt-1">
                                                                        {item.food.dietary && (
                                                                            <span
                                                                                className="px-2 py-0.5 text-xs font-semibold text-white bg-blue-500 rounded-full">{item.food.dietary}</span>
                                                                        )}
                                                                        <span
                                                                            className="px-2 py-0.5 text-xs font-semibold text-white bg-green-500 rounded-full">{item.food.type}</span>
                                                                    </div>
                                                                </td>
                                                                <td className={`px-4 py-2 text-xs md:text-sm font-medium w-1/6`}>
                                                                    {timeslot[0]}
                                                                </td>
                                                                <td className="px-4 py-2 text-xs md:text-sm font-medium text-gray-900 w-1/6 hidden sm:block">{order.name}</td>
                                                                <td className={`px-4 py-2 text-xs md:text-sm font-medium w-1/6`}>
                                                                    <button
                                                                        className="p-1 rounded-md border border-gray-300 bg-white text-xs md:text-sm font-medium text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                                        onClick={() => updateItemStatus(order._id, itemIndex, item.status === 'readyToCook' ? 'prepping' : 'readyToCook')}>
                                                                        {item.status === 'readyToCook' ? '✅ Done' : item.status}
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        </>
                                                    )
                                                }
                                            ))}
                                        </>
                                    )))}
                                </>
                            ))}
                        </tbody>
                    </table>

                </div>
            </div>
        </div>
    );
}

export default WithAuth(Page);
