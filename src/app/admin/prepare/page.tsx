// app/pizza-maker/page.tsx
'use client'

import React, { useEffect, useState } from 'react';
import { AlertCircle, Clock } from 'lucide-react';
import { getFromLocalStorage } from '@/lib/localStorage';
import { ITEM_STATUSES, ORDER_STATUSES, OrderDocument } from '@/model/order';
import { ItemDocument } from "@/model/item";
import { ordersSortedByTimeslots } from "@/lib/order";
import { Heading } from "@/app/components/layout/Heading";
import { useTranslations } from 'next-intl';

interface ItemType {
    id: string;
    name: string;
    type: string;
    dietary?: string;
    color?: string;
    emoji?: any;
}

const PizzaMakerStation = () => {
    const [items, setItems] = useState<ItemType[]>([]);
    const [orders, setOrders] = useState<OrderDocument[]>([]);
    const [upcomingPizzas, setUpcomingPizzas] = useState<Map<string, number>>(new Map());
    const [recentlyMade, setRecentlyMade] = useState<string[]>([]);
    const [error, setError] = useState('');

    const t = useTranslations();

    const token = getFromLocalStorage('token', '');
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
    };

    useEffect(() => {
        fetch("/api/pizza") // Consider moving fetch logic to a dedicated service/hook
            .then(async response => {
                const data = await response.json() as ItemDocument[]
                setItems(data.map(item => ({
                    id: item._id.toString(),
                    name: item.name,
                    type: item.type,
                    dietary: item.dietary
                }) as ItemType))
            })
            .catch(error => {
                console.error('Error fetching items menu:', error);
                setError(`Failed to load menu: ${error.message}`); // Provide more context
            })
    }, []);

    // Fetch orders and calculate upcoming pizzas
    const fetchOrders = async () => {
        const response = await fetch('/api/order', { headers });
        const data = await response.json();

        if (!response.ok) {
            setError(data.message ?? response.statusText);
            return;
        }

        const filteredOrders = ordersSortedByTimeslots(data.filter((order: OrderDocument) => order.status === ORDER_STATUSES.ORDERED))
        setOrders(filteredOrders);
        calculateUpcomingPizzas(data);
    };

    // Calculate what pizzas need to be made
    const calculateUpcomingPizzas = (orders: OrderDocument[]) => {
        const pizzaCount = new Map<string, number>();


        orders.forEach(order => {
            if (order.status === 'ordered' || order.status === 'inPreparation') {
                order.items.forEach(item => {
                    if (item.status === 'prepping' && item.item.type === 'pizza') {
                        const key = item.item.name;
                        pizzaCount.set(key, (pizzaCount.get(key) ?? 0) + 1);
                    }
                });
            }
        });

        setUpcomingPizzas(pizzaCount);
    };

    // Mark items as ready (ready to cook)
    const markPizzaReady = async (pizzaType: ItemType) => {
        // Find the first order that needs this items type
        const targetOrder = orders.find(order =>
            (order.status === 'ordered' || order.status === 'inPreparation') &&
            order.items.some(item =>
                item.item.name === pizzaType.name &&
                item.status === 'prepping'
            )
        );

        if (!targetOrder) {
            setError(`No pending orders for ${pizzaType.name}`);
            return;
        }

        // Find the specific item index
        const itemIndex = targetOrder.items.findIndex(item =>
            item.item.name === pizzaType.name &&
            item.status === 'prepping'
        );

        // Update item status
        const updatedOrder = { ...targetOrder };
        updatedOrder.items[itemIndex].status = ITEM_STATUSES.READY_TO_COOK;

        const response = await fetch('/api/order', {
            method: 'PUT',
            headers,
            body: JSON.stringify({
                id: targetOrder._id.toString(),
                order: updatedOrder
            })
        });

        if (!response.ok) {
            setError('Failed to update order');
            return;
        }

        // Add to recently made list for visual feedback
        setRecentlyMade([...recentlyMade, pizzaType.name]);
        setTimeout(() => {
            setRecentlyMade(prev => prev.filter(name => name !== pizzaType.name));
        }, 2000);

        // Refresh orders
        fetchOrders();
    };

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div>
            {/* TODO: add missing translations*/}
            <Heading title={t('admin.prepare.title')} description={"Tap when pizza is ready for oven"}
                     icon={<Clock className="w-10 h-10 text-gray-900"/>}/>


            <div className="flex flex-col md:flex-row gap-5">
                <div className="bg-white p-4 md:p-8 rounded-2xl w-full md:w-1/3">
                    <div className="flex flex-wrap gap-2">
                        <div className="flex flex-col gap-2">
                            {orders.map(order => (
                                <>
                                    {order.items
                                        .filter(item => item.status === ITEM_STATUSES.PREPPING)
                                        .map((item) => (
                                                <span key={item.item.name}
                                                      className={`border px-3 py-1 rounded-lg text-sm ${item.status !== ITEM_STATUSES.PREPPING ? 'bg-green-50 border-green-100 text-gray-400' : ''}`}>
                                            {item.item.name} <span
                                                    className="bg-gray-100 py-0.5 px-1  rounded-2xl">{order.timeslot}</span>
                                      </span>)
                                        )}
                                </>
                            ))}
                        </div>
                        {upcomingPizzas.size === 0 && (
                            <span className="text-gray-400">{t('admin.prepare.no_open_orders')} 🎉</span>
                        )}
                    </div>
                </div>

                {/* Pizza buttons grid */}
                <div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                        {items.map(pizza => {
                            const pendingCount = upcomingPizzas.get(pizza.name) ?? 0;
                            const isRecent = recentlyMade.includes(pizza.name);

                            return (
                                <button
                                    key={pizza.id}
                                    className={`
                aspect-4/3 ${pizza.color} bg-opacity-90 rounded-3xl p-6 md:p-4 
                shadow-2xl transform transition-all duration-200
                ${pendingCount > 0 ? 'hover:scale-105 active:scale-95 cursor-pointer' : 'opacity-50 cursor-not-allowed'}
                ${isRecent ? 'ring-4 ring-green-400 ring-opacity-75' : ''}
              `}
                                    onClick={() => pendingCount > 0 && markPizzaReady(pizza)}
                                    disabled={pendingCount === 0}
                                >
                                    <div className="flex flex-col items-center justify-center h-full">
                                        <div className="text-6xl md:text-8xl mb-4">{pizza.emoji}</div>
                                        <h3 className="text-2xl md:text-3xl font-bold text-black">{pizza.name}</h3>
                                        {pizza.dietary && (
                                            <span
                                                className="text-sm text-black opacity-75 mt-1">{pizza.dietary}</span>
                                        )}
                                        {pendingCount > 0 && (
                                            <div className="mt-4 bg-white bg-opacity-25 rounded-full px-4 py-2">
                                                <span
                                                    className="text-xl font-bold text-black">{pendingCount} needed</span>
                                            </div>
                                        )}
                                        {isRecent && (
                                            <span className="text-green-300 text-lg mt-2">✓ Marked ready!</span>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {error && (
                <div
                    className="fixed bottom-8 right-8 bg-red-500 text-black rounded-lg px-6 py-4 flex items-center gap-3">
                    <AlertCircle className="w-6 h-6"/>
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
};

export default PizzaMakerStation;
