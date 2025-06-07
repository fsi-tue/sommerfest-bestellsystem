// app/pizza-cook/page.tsx
'use client'

import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, Flame, Timer } from 'lucide-react';
import { getFromLocalStorage } from '@/lib/localStorage';
import WithAuth from '@/app/admin/WithAuth';
import type { OrderDocument } from '@/model/order';
import { ITEM_STATUSES } from '@/model/order';
import { Heading } from "@/app/components/layout/Heading";

interface OvenSlot {
    id: number;
    pizza: {
        orderId: string;
        itemIndex: number;
        name: string;
        emoji: string;
        startTime: Date;
        cookTime: number; // in seconds
    } | null;
}

interface QueuedPizza {
    orderId: string;
    itemIndex: number;
    name: string;
    emoji: string;
}

const OVEN_SLOTS = 6;
const DEFAULT_COOK_TIME = 180; // 3 minutes

const CountdownTimer = ({ endTime, onComplete }: { endTime: Date; onComplete: () => void }) => {
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            const remaining = Math.max(0, endTime.getTime() - new Date().getTime());
            setTimeLeft(Math.floor(remaining / 1000));

            if (remaining === 0) {
                onComplete();
            }
        }, 100);

        return () => clearInterval(interval);
    }, [endTime, onComplete]);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const progress = ((DEFAULT_COOK_TIME - timeLeft) / DEFAULT_COOK_TIME) * 100;

    return (
        <div className="w-full">
            <div className="text-4xl font-bold text-white mb-2">
                {minutes}:{seconds.toString().padStart(2, '0')}
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
                <div
                    className="bg-green-400 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
};

const PizzaCookStation = () => {
    const [orders, setOrders] = useState<OrderDocument[]>([]);
    const [ovenSlots, setOvenSlots] = useState<OvenSlot[]>(
        Array.from({ length: OVEN_SLOTS }, (_, i) => ({ id: i, pizza: null }))
    );
    const [queuedPizzas, setQueuedPizzas] = useState<QueuedPizza[]>([]);
    const [error, setError] = useState('');

    const token = getFromLocalStorage('token', '');
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
    };

    // Fetch orders and update queue
    const fetchOrders = async () => {
        try {
            const response = await fetch('/api/order', { headers });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message ?? response.statusText);
            }

            setOrders(data);
            updateQueuedPizzas(data);
        } catch (error) {
            setError(error.message);
        }
    };

    // Update the queue of pizzas ready to cook
    const updateQueuedPizzas = (orders: OrderDocument[]) => {
        const queued: QueuedPizza[] = [];

        orders.forEach(((order, orderIndex) => {
            order.items.forEach((item, itemIndex) => {
                if (item.status === ITEM_STATUSES.READY_TO_COOK && item.item.type === 'pizza') {
                    queued.push({
                        orderId: order._id.toString(),
                        itemIndex: itemIndex,
                        name: item.item.name,
                        emoji: getPizzaEmoji(item.item.name, item.item.dietary)
                    });
                } else if (item.status === ITEM_STATUSES.COOKING && item.item.type === 'pizza' && itemIndex < ovenSlots.length) {
                    ovenSlots[itemIndex] = {
                        id: itemIndex,
                        pizza: {
                            orderId: order._id.toString(),
                            itemIndex: itemIndex,
                            name: item.item.name,
                            emoji: getPizzaEmoji(item.item.name, item.item.dietary),
                            startTime: new Date(),
                            cookTime: DEFAULT_COOK_TIME,
                        }
                    };
                }
            });
        }));

        setQueuedPizzas(queued);
    };

    // Get pizza emoji based on type
    const getPizzaEmoji = (name: string, dietary?: string): string => {
        if (dietary === 'vegan') {
            return '🌱';
        }
        if (dietary === 'vegetarian') {
            return '🥬';
        }
        if (name.toLowerCase().includes('pepperoni')) {
            return '🌶️';
        }
        return '🍕';
    };

    // Add pizza to oven
    const addToOven = async (pizza: QueuedPizza, slotId: number) => {
        const slot = ovenSlots.find(s => s.id === slotId);
        if (!slot || slot.pizza) {
            return;
        }

        // Update item status to cooking
        const order = orders.find(o => o._id.toString() === pizza.orderId);
        if (!order) {
            return;
        }

        const updatedOrder = { ...order };
        updatedOrder.items[pizza.itemIndex].status = ITEM_STATUSES.COOKING;

        try {
            const response = await fetch('/api/order', {
                method: 'PUT',
                headers,
                body: JSON.stringify({
                    id: pizza.orderId,
                    order: updatedOrder
                })
            });

            if (!response.ok) {
                throw new Error('Failed to update order');
            }

            // Update oven slot
            const newSlots = [...ovenSlots];
            newSlots[slotId] = {
                ...slot,
                pizza: {
                    ...pizza,
                    startTime: new Date(),
                    cookTime: DEFAULT_COOK_TIME
                }
            };
            setOvenSlots(newSlots);

            // Refresh orders
            fetchOrders();
        } catch (error) {
            setError(error.message);
        }
    };

    // Handle pizza completion
    const handlePizzaComplete = async (slotId: number) => {
        const slot = ovenSlots.find(s => s.id === slotId);
        if (!slot || !slot.pizza) {
            return;
        }

        const { orderId, itemIndex } = slot.pizza;
        const order = orders.find(o => o._id.toString() === orderId);
        if (!order) {
            return;
        }

        const updatedOrder = { ...order };
        updatedOrder.items[itemIndex].status = ITEM_STATUSES.READY;

        try {
            const response = await fetch('/api/order', {
                method: 'PUT',
                headers,
                body: JSON.stringify({
                    id: orderId,
                    order: updatedOrder
                })
            });

            if (!response.ok) {
                throw new Error('Failed to update order');
            }

            // Clear oven slot
            const newSlots = [...ovenSlots];
            newSlots[slotId] = { ...slot, pizza: null };
            setOvenSlots(newSlots);

            // Refresh orders
            fetchOrders();
        } catch (error) {
            setError(error.message);
        }
    };

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-black text-white p-4 md:p-6">

            <Heading title={"Pizza Oven"} description={"Drag pizzas to empty slots"}
                     icon={<Flame className="w-10 h-10 text-gray-900"/>}/>

            {/* Oven slots */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                {ovenSlots.map((slot) => (
                    <div
                        key={slot.id}
                        className={`
              aspect-square rounded-3xl p-6 flex flex-col items-center justify-center
              transition-all duration-300 border-2
              ${slot.pizza
                            ? 'bg-orange-600 border-orange-400'
                            : 'bg-gray-800 border-gray-600 border-dashed'
                        }
            `}
                        onDrop={(e) => {
                            e.preventDefault();
                            if (!slot.pizza) {
                                const pizzaData = JSON.parse(e.dataTransfer.getData('pizza'));
                                addToOven(pizzaData, slot.id);
                            }
                        }}
                        onDragOver={(e) => e.preventDefault()}
                    >
                        {slot.pizza ? (
                            <>
                                <div className="text-6xl mb-4">{slot.pizza.emoji}</div>
                                <h3 className="text-xl font-bold mb-4">{slot.pizza.name}</h3>
                                <CountdownTimer
                                    endTime={new Date(slot.pizza.startTime.getTime() + slot.pizza.cookTime * 1000)}
                                    onComplete={() => handlePizzaComplete(slot.id)}
                                />
                                <button
                                    onClick={() => handlePizzaComplete(slot.id)}
                                    className="mt-4 bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                                >
                                    <CheckCircle className="w-5 h-5"/>
                                    Mark Done
                                </button>
                            </>
                        ) : (
                            <div className="text-center">
                                <Timer className="w-16 h-16 text-gray-600 mb-2"/>
                                <p className="text-gray-400">Empty Slot</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Pizza queue */}
            <div className="bg-gray-900 rounded-3xl p-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-6 h-6 text-yellow-500"/>
                    Ready to Cook ({queuedPizzas.length})
                </h2>
                <div className="flex gap-4 overflow-x-auto pb-4">
                    {queuedPizzas.length === 0 ? (
                        <p className="text-gray-400">No pizzas ready to cook</p>
                    ) : (
                        queuedPizzas.map((pizza, index) => (
                            <div
                                key={`${pizza.orderId}-${pizza.itemIndex}`}
                                draggable
                                onDragStart={(e) => {
                                    e.dataTransfer.setData('pizza', JSON.stringify(pizza));
                                }}
                                className="shrink-0 bg-gray-800 rounded-2xl p-4 cursor-move hover:bg-gray-700 transition-colors"
                            >
                                <div className="text-4xl mb-2 text-center">{pizza.emoji}</div>
                                <p className="text-sm font-medium">{pizza.name}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Error message */}
            {error && (
                <div className="fixed bottom-8 right-8 bg-red-500 text-white rounded-lg px-6 py-4">
                    {error}
                </div>
            )}
        </div>
    );
};

export default WithAuth(PizzaCookStation);
