'use client'

import './order/Order.css';
import { useEffect, useState } from "react";
import Timeline from "@/app/components/Timeline.jsx";
import ErrorMessage from "@/app/components/ErrorMessage.jsx";
import WithSystemCheck from "./WithSystemCheck.jsx";
import { getDateFromTimeSlot } from "@/lib/time";
import { ORDER } from "@/config";
import { FoodDocument } from '@/model/food';

const EVERY_X_SECONDS = 60;

const Food = ({ food, addClick }: { food: FoodDocument, addClick: () => void }) => {
    return (
        <li className="p-4 rounded-lg shadow-sm border-collapse border border-gray-300 transition-shadow duration-300 mb-2">
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex space-x-2">
                        {food.dietary && (<span
                                className="px-3 py-1 text-xs border border-gray-100 rounded-full">{food.dietary}</span>
                        )}
                        <span
                            className="px-3 py-1 text-xs border border-gray-100 rounded-full">{food.type}</span>
                    </div>
                    <span className="text-base font-semibold text-gray-900">{food.price}€ {food.name}</span>
                </div>
                <div className="flex items-center">
                    <button onClick={addClick}
                            className="mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 bg-primary-400 shadow-primary-300 text-white rounded-md px-3 py-1 text-sm">
                        Add
                    </button>
                </div>
            </div>
            <div className="font-light leading-7 text-gray-800 mt-2 text-xs">
                {food.ingredients ? food.ingredients.join(', ') : ''}
            </div>
        </li>
    );
};

const FloatingIslandElement = ({ content, title }: { content: string | number, title: string }) => {
    return (
        <div className="p-2.5 text-nowrap h-full flex flex-col items-center justify-center">
            <div className="flex flex-col items-center justify-center max-w-48 overflow-x-auto text-center">
                <div className="">
                    {content}
                </div>
            </div>
            <div className="self-start mt-1 font-light leading-7">
                {title}
            </div>
        </div>
    )
}

// Order component
const Page = () => {
    // State to hold the order
    const [error, setError] = useState('');
    const [foods, setFoods] = useState({} as { [_id: string]: FoodDocument[] });
    const [floatingIslandOpen, setFloatingIslandOpen] = useState(false);

    interface OrderType {
        name: string;
        items: { [_id: string]: FoodDocument[] };
        comment: string;
        timeslot: string | null;
    }

    const [order, setOrder] = useState<OrderType>({ name: '', items: {}, comment: '', timeslot: null });

    // Set the start and end date for the timeline
    const start = new Date();
    start.setHours(start.getHours() - 1);  // Previous hour
    start.setMinutes(0, 0, 0);

    const end = new Date();
    end.setHours(end.getHours() + 1);  // Next hour
    end.setMinutes(59, 59, 999);

    // Fetch the pizza menu from the server
    useEffect(() => {
        // Fetch the pizza menu from the server
        fetch("/api/pizza")
            .then(async response => {
                const data = await response.json();
                if (!response.ok) {
                    const error = (data && data.message) || response.statusText;
                    throw new Error(error);
                }
                return data;
            })
            .then(data => {
                setFoods(data);
            })
            .catch(error => {
                console.error('There was an error!', error);
                setError(error.message);
            });
    }, []);

    /**
     * Update the order with the new values
     * @param updatedOrder
     */
    const updateOrder = (updatedOrder: Partial<OrderType>) => {
        setOrder({ ...order, ...updatedOrder });
    };

    /**
     * Add food to the order
     * @param food
     */
    const addToOrder = (food: FoodDocument) => {
        setError('');
        const updateItems = [...order.items[food._id.toString()] ?? [], food];
        const items = { ...order.items };
        items[food._id.toString()] = updateItems;
        updateOrder({ items: items });
    }

    /**
     * Remove food from the order
     * @param food
     */
    const removeFromOrder = (food: FoodDocument) => {
        setError('');
        const updateItems = [...order.items[food._id.toString()] ?? []];
        updateItems.pop();
        const items = { ...order.items };
        updateOrder({ items: items });
    }

    /**
     * Set the timeslot of the order
     */
    const setTimeslot = (timeslot: string) => {
        // Check if the timeslot is not in the past
        const BUFFER = ORDER.TIMESLOT_DURATION;

        // Get time with buffer
        const currentTime = new Date();
        currentTime.setMinutes(currentTime.getMinutes() + BUFFER);

        const timeslotTime = getDateFromTimeSlot(timeslot).toDate()

        if (timeslotTime < currentTime) {
            setError('You cannot choose a timeslot in the past.');
            setTimeout(() => setError(''), 5000);
            return;
        }

        updateOrder({ timeslot: timeslot });
    }

    /**
     * Set the name of the order
     * @param name
     */
    const setName = (name: string) => {
        updateOrder({ name: name });
    };

    /**
     * Set the comment of the order
     */
    const setComment = (comment: string) => {
        updateOrder({ comment: comment });
    }

    /**
     * Get the total price of the order
     */
    const getTotalPrice = (): number => {
        return Object.values(order.items).reduce((total, items) => {
            return total + items.reduce((total, item) => total + item.price, 0);
        }, 0);
    }

    /**
     * Get the total number of items in the order
     */
    const getTotalItems = (): number => {
        return Object.values(order.items)
            .flatMap(items => items)
            .reduce((total, item) => total + item.size, 0);
    }


    return (
        <div>
            <div className="bg-white p-8 rounded-lg shadow-md mb-8">
                <h2 className="text-4xl font-extrabold mb-6 text-center text-gray-900">Order your pizza at Sommerfest
                    2024!</h2>
                <div className="mb-8 font-light leading-7 text-gray-800">
                    <ol className="list-decimal list-inside space-y-4">
                        <li>
                            <p className="text-lg font-semibold">Choose Pizza:</p>
                            <p>Select whole or halved from the list below (a whole pizza has a diameter of 12 inches /
                                30 cm).</p>
                        </li>
                        <li>
                            <p className="text-lg font-semibold">Pick-Up Time:</p>
                            <p>Choose a time (some slots may be full).</p>
                        </li>
                        <li>
                            <p className="text-lg font-semibold">Pay in Cash:</p>
                            <p>Pay when collecting at the counter.</p>
                        </li>
                    </ol>
                    <div className="mt-6">
                        <p className="text-lg font-semibold">Order Times:</p>
                        <p>Earliest pick-up: 17:25</p>
                        <p>Latest order: 23:40</p>
                    </div>
                    <p className="mt-8 text-center text-xl text-gray-700">Enjoy your evening!</p>
                </div>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md mb-8">
                <div className="flex flex-col md:flex-row justify-between gap-8">
                    <div className="md:w-1/2 w-full">
                        <h3 className="text-2xl font-semibold mb-6 text-gray-900">Menu</h3>
                        <p className="mb-6 text-lg font-light leading-7 text-gray-800">Select your pizza from the list
                            below. Ingredients are at the bottom.</p>
                        <a id="selectorder"></a>
                        <ul className="space-y-4">
                            {Object.entries(foods)
                                .flatMap(([_, foods]) => foods)
                                .filter(food => food.enabled)
                                .map((food, index) => (
                                    <Food
                                        key={`${food.name}-${index}`}
                                        food={food}
                                        addClick={() => addToOrder(food)}
                                    />
                                ))}
                            {!foods.length && <p>Loading...</p>}
                        </ul>
                    </div>

                    <div className="md:w-1/2 w-full">
                        <a id="order"/>
                        <h3 className="text-2xl font-semibold mb-6 text-gray-900">Your current order</h3>
                        {error && <ErrorMessage error={error}/>}

                        <div className="mb-6">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                placeholder="Enter your name"
                                className="mt-1 p-3 border-collapse border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm mb-4"
                                onChange={(e) => setName(e.target.value)}
                            />
                            <label htmlFor="comment" className="block text-sm font-medium text-gray-700">Comment</label>
                            <textarea
                                id="comment"
                                name="comment"
                                placeholder="Enter your comment (optional)"
                                className="mt-1 p-3 border-collapse border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm mb-4"
                                onChange={(e) => setComment(e.target.value)}
                            />
                        </div>

                        <div className="timeline-container mt-8">
                            <h2 className="text-2xl font-semibold mb-4 text-gray-900">Timeslot</h2>
                            <p className="mb-4 text-lg font-light leading-7 text-gray-800">Select your timeslot for
                                pick-up.</p>

                            <Timeline startDate={start} stopDate={end} setTimeslot={setTimeslot}
                                      every_x_seconds={EVERY_X_SECONDS}/>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating island */}
            <div
                className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 px-1 md:px-3 py-1 md:py-3 rounded-2xl bg-primary-400 shadow-primary-300 shadow-2xl text-white w-96">
                <div
                    className="flex items-center justify-between transition-all duration-300  cursor-pointer hover:scale-105" onClick={() => setFloatingIslandOpen(!floatingIslandOpen)}>
                    {floatingIslandOpen && (
                        <ul className="space-y-4">
                    {order && Object.keys(order.items)
                                .map((item, index) => (
                                    <div key={`${item}-${index}`}>
                                        <Food food={order.items[item][0]} addClick={() => removeFromOrder(order.items[item][0])}/>
                                    </div>
                                ))}
                        </ul>
                    )}
                    {!floatingIslandOpen && !error && (
                        <>
                            <FloatingIslandElement title="Items"
                                                   content={getTotalItems()}/>
                            <div className="mx-2 bg-gray-300 dark:bg-white-600 w-px h-10 inline-block"/>
                            <FloatingIslandElement title="Total Price"
                                                   content={`${getTotalPrice()}€`}/>
                            <div className="mx-2 bg-gray-300 dark:bg-white-600 w-px h-10 inline-block"/>
                            <FloatingIslandElement title="Timeslot" content={order.timeslot ?? 'Not selected'}/>
                        </>)
                    }
                    {error && (
                        <ErrorMessage error={error}/>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WithSystemCheck(Page);
