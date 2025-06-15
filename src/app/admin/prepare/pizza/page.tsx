// app/pizza-maker/page.tsx
'use client'

import React, { useEffect, useState } from 'react';
import { AlertCircle, Clock } from 'lucide-react';
import { ITEM_STATUSES, ORDER_STATUSES, OrderDocument } from '@/model/order';
import { Heading } from "@/app/components/layout/Heading";
import { useTranslations } from 'next-intl';
import { timeslotToLocalTime } from "@/lib/time";
import { useItems } from "@/lib/fetch/item";
import { Loading } from "@/app/components/Loading";
import { updateOrder, useOrders } from "@/lib/fetch/order";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const PizzaMakerStation = () => {
    const queryClient = useQueryClient();
    const [upcomingPizzas, setUpcomingPizzas] = useState<Map<string, number>>(new Map());
    const [recentlyMade, setRecentlyMade] = useState<string[]>([]);
    const [error, setError] = useState('');

    const t = useTranslations();

    const { data: items, error: itemsError, isFetching: isFetchingItems } = useItems()
    const { data: orders, error: ordersError } = useOrders(5000)

    const updateOrderMutation = useMutation({
        mutationFn: async ({ orderId, order }: {
            orderId: string;
            order: OrderDocument
        }) => updateOrder(orderId, order),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
    });
    useEffect(() => {
        if (orders) {
            const filteredOrders = orders.filter((order) => order.status === ORDER_STATUSES.ORDERED)
            calculateUpcomingPizzas(filteredOrders);
        }
    }, [items, orders]);
    useEffect(() => {
        if (itemsError) {
            setError(itemsError.message)
        } else if (ordersError) {
            setError(ordersError.message)
        }
    }, [ordersError, itemsError]);

    if (isFetchingItems) {
        return <Loading message={t('loading_menu')}/>
    }

    if (!items || !orders) {
        return null;
    }

    // Calculate what pizzas need to be made
    const calculateUpcomingPizzas = (orders: OrderDocument[]) => {
        const pizzaCount = new Map<string, number>();
        for (const order of orders) {
            if (order.status !== ORDER_STATUSES.ORDERED && order.status !== ORDER_STATUSES.ACTIVE) {
                continue;
            }

            for (const item of order.items) {
                if (item.status === 'prepping' && item.item.type === 'pizza') {
                    const key = item.item.name;
                    pizzaCount.set(key, (pizzaCount.get(key) ?? 0) + 1);
                }
            }
        }

        setUpcomingPizzas(pizzaCount);
    };

    // Mark items as ready (ready to cook)
    const markPizzaReady = async (itemId: string) => {
        // Find the first order that needs this items type
        const targetOrder = orders.find(order =>
            (order.status === ORDER_STATUSES.ORDERED || order.status === ORDER_STATUSES.ACTIVE) &&
            order.items.some(item =>
                item.item._id.toString() === itemId &&
                item.status === 'prepping'
            )
        );

        if (!targetOrder) {
            setError(`No pending orders for that item found`);
            return;
        }

        // Find the specific item index
        const itemIndex = targetOrder.items.findIndex(item =>
            item.item._id.toString() === itemId &&
            item.status === 'prepping'
        );

        // Update item status
        const updatedOrder = { ...targetOrder } as OrderDocument;
        updatedOrder.items[itemIndex].status = ITEM_STATUSES.READY_TO_COOK;

        updateOrderMutation.mutate({ orderId: targetOrder._id.toString(), order: updatedOrder })
    };

    return (
        <div>
            <Heading title={t('admin.prepare.title')} description={t('admin.prepare.subtitle')}
                     icon={<Clock className="w-10 h-10 text-gray-900"/>}/>


            <div className="flex flex-col md:flex-row gap-5">
                <div className="bg-white p-4 md:p-8 rounded-2xl w-full md:w-1/3">
                    <div className="flex flex-col gap-2 max-h-[15rem] md:max-h-fit overflow-y-scroll ">
                        {orders.map(order => {
                            return order.items
                                .filter(item => item.status === ITEM_STATUSES.PREPPING)
                                .map((item, index) => (
                                    <div
                                        key={`${order._id.toString()}-${item.item._id.toString()}-${item.status}-${index}`}
                                        className={`border px-3 py-1 rounded-lg text-sm flex items-center justify-between ${item.status !== ITEM_STATUSES.PREPPING ? 'bg-green-50 border-green-100 text-gray-400' : ''}`}>
                                        {item.item.name}
                                        <span className="bg-gray-100 py-0.5 px-1  rounded-2xl">
                                                {timeslotToLocalTime(order.timeslot)}
                                            </span>
                                    </div>)
                                )
                        })}
                    </div>
                    {upcomingPizzas.size === 0 && (
                        <span className="text-gray-400">{t('admin.prepare.no_open_orders')} 🎉</span>
                    )}
                </div>

                {/* Pizza buttons grid */}
                <div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                        {items.map(item => {
                            const pendingCount = upcomingPizzas.get(item.name) ?? 0;
                            const isRecent = recentlyMade.includes(item.name);

                            return (
                                <button
                                    key={`${item.id}-${item.name}`}
                                    className={`
                aspect-4/3 bg-opacity-90 rounded-3xl p-3 md:p-4 
                shadow-2xl transform transition-all duration-200
                ${pendingCount > 0 ? 'hover:scale-105 active:scale-95 cursor-pointer' : 'opacity-50 cursor-not-allowed'}
                ${isRecent ? 'ring-4 ring-green-400 ring-opacity-75' : ''}
              `}
                                    onClick={() => pendingCount > 0 && markPizzaReady(item._id.toString())}
                                    disabled={pendingCount === 0}
                                >
                                    <div className="flex flex-col items-center justify-center h-full">
                                        <h3 className="text-2xl md:text-3xl font-bold text-black">{item.name}</h3>
                                        {item.dietary && (
                                            <span
                                                className="text-sm text-black opacity-75 mt-1">{item.dietary}</span>
                                        )}
                                        {pendingCount > 0 && (
                                            <div className="mt-4 bg-white bg-opacity-25 rounded-2xl px-4 py-2">
                                                <span
                                                    className="text-lg font-medium text-black">{pendingCount} needed</span>
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
