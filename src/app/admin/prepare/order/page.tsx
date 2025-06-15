'use client'

import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle, Minus, Pizza, Plus, ScanIcon, XIcon } from 'lucide-react';
import { IDetectedBarcode, Scanner } from "@yudiel/react-qr-scanner";
import { ITEM_STATUSES, ItemStatus, ORDER_STATUSES, OrderDocument } from '@/model/order';
import { timeslotToLocalTime, timeslotToUTCDate } from '@/lib/time';
import SearchInput from '@/app/components/SearchInput';
import Button from '@/app/components/Button';
import { Heading } from "@/app/components/layout/Heading";
import ErrorMessage from "@/app/components/ErrorMessage";
import { UTCDate } from "@date-fns/utc";
import { Loading } from "@/app/components/Loading";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useItems } from "@/lib/fetch/item";
import { updateOrder, useOrders } from "@/lib/fetch/order";

interface ItemType {
    id: string;
    name: string;
    type: string;
    dietary?: string;
}

// Pizza Inventory Component
const PizzaInventory = ({
                            inventory,
                            onChangeItemStatus,
                        }: {
    inventory: Map<string, number>;
    onChangeItemStatus: (assignments: Map<string, number>, status: ItemStatus) => void;
}) => {
    const [selectedPizzas, setSelectedPizzas] = useState<Map<string, number>>(new Map());

    const { data: itemsData, isLoading: itemsLoading, error: itemsError } = useItems();
    const items: ItemType[] = useMemo(() => {
        if (!itemsData) {
            return [];
        }
        return itemsData.map(item => ({
            id: item._id.toString(),
            name: item.name,
            type: item.type,
            dietary: item.dietary
        }));
    }, [itemsData]);

    const handleQuantityChange = (type: string, delta: number) => {
        const currentSelected = selectedPizzas.get(type) ?? 0;
        const newSelected = currentSelected + delta;

        const newMap = new Map(selectedPizzas);
        if (newSelected === 0) {
            newMap.delete(type);
        } else {
            newMap.set(type, newSelected);
        }
        setSelectedPizzas(newMap);
    };

    const handleStatus = (status: ItemStatus) => {
        onChangeItemStatus(selectedPizzas, status);
        setSelectedPizzas(new Map());
    };

    const totalSelected = Array.from(selectedPizzas.values()).reduce((sum, count) => sum + count, 0);

    if (itemsLoading) {
        return <Loading/>;
    }
    if (itemsError) {
        return <ErrorMessage error={itemsError.message}/>;
    }

    return (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
                {totalSelected !== 0 && (
                    <div className="flex items-center gap-2">
                        <Button
                            onClick={() => handleStatus(ITEM_STATUSES.READY)}
                            className="text-black px-6 py-3 border rounded-2xl font-medium transition-colors flex items-center gap-2"
                        >
                            <CheckCircle className="w-5 h-5"/>
                            Mark {totalSelected} Pizza{totalSelected > 1 ? 's' : ''} ready
                        </Button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {items.map((item) => {
                    const selected = selectedPizzas.get(item.name) ?? 0;
                    const count = inventory.get(item.name) ?? 0;

                    return (
                        <div
                            key={item.name}
                            className={`border-2 rounded-xl p-4 transition-all ${
                                selected > 0 ? 'border-green-400 bg-green-50' : 'border-gray-200'
                            }`}
                        >
                            <div className="text-center mb-3">
                                <h3 className="font-bold text-lg capitalize">{item.name}</h3>
                                <p className="text-3xl font-bold text-gray-800 mt-2">{count}</p>
                                <p className="text-sm text-gray-500">available</p>
                            </div>

                            <div className="flex items-center justify-center gap-2">
                                <Button
                                    onClick={() => handleQuantityChange(item.name, -1)}
                                    className={`p-2 rounded-lg transition-all ${
                                        selected === 0
                                            ? 'bg-gray-100 text-gray-400'
                                            : 'bg-red-100 text-red-600 hover:bg-red-200'
                                    }`}
                                >
                                    <Minus className="w-5 h-5"/>
                                </Button>

                                <span className="w-12 text-center font-bold text-lg">{selected}</span>

                                <Button
                                    onClick={() => handleQuantityChange(item.name, +1)}
                                    className={`p-2 rounded-lg transition-all ${
                                        selected >= count
                                            ? 'bg-gray-100 text-gray-400'
                                            : 'bg-green-100 text-green-600 hover:bg-green-200'
                                    }`}
                                >
                                    <Plus className="w-5 h-5"/>
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// Simplified Order Card (unchanged)
const OrderCard = ({
                       order,
                       isOverdue,
                       onPay,
                       onDeliver,
                   }: {
    order: OrderDocument;
    isOverdue: boolean;
    onPay: (orderId: string) => void;
    onDeliver: (orderId: string) => void;
}) => {
    const readyItems = order.items.filter(item => item.status === ITEM_STATUSES.READY).length;
    const totalItems = order.items.length;
    const progress = (readyItems / totalItems) * 100;

    return (
        <div className={`bg-white rounded-lg p-4 border-2 transition-all ${
            isOverdue ? 'border-red-300 bg-red-50' : 'border-gray-200'
        }`}>
            <div className="flex items-start justify-between mb-3">
                <div>
                    <h3 className="font-bold text-lg">{order.name}</h3>
                    <p className="text-sm text-gray-600">#{order._id.toString().slice(-8)}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    isOverdue ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                }`}>
                    {timeslotToLocalTime(order.timeslot)}
                </div>
            </div>

            <div className="space-y-2">
                {order.items.map((item, idx) => (
                    <div key={`${order._id.toString()}-${item.item._id.toString()}-${idx}`}
                         className="flex items-center justify-between text-sm">
                        <span className={item.status === ITEM_STATUSES.READY ? 'text-green-600 font-medium' : ''}>
                          {item.item.name}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-xs">
                            {item.status}
                        </span>
                    </div>
                ))}
            </div>

            {(order.status !== ORDER_STATUSES.COMPLETED && order.status !== ORDER_STATUSES.CANCELLED) && (
                <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-green-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{readyItems}/{totalItems} ready</p>
                </div>
            )}

            <div className="mt-3 flex flex-row gap-2">
                {(order.status !== ORDER_STATUSES.COMPLETED && order.status !== ORDER_STATUSES.CANCELLED) && (
                    <Button onClick={() => onDeliver(order._id.toString())} rateLimitMs={500}
                            className={`${order.isPaid ? 'bg-green-400' : 'bg-red-500'} text-white px-3 py-1 border rounded-2xl font-medium transition-colors flex items-center gap-2`}>
                        Deliver
                    </Button>
                )}
                <Button onClick={() => onPay(order._id.toString())} rateLimitMs={500}
                        className={`px-3 py-1 border rounded-2xl font-medium transition-colors flex items-center gap-2 ${
                            !order.isPaid ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                    {!order.isPaid ? 'Unpaid!' : 'Paid'}
                </Button>
            </div>
        </div>
    );
};

// QR Scanner Modal (unchanged)
const QRScannerModal = ({ isOpen, onClose, onScan }: {
    isOpen: boolean;
    onClose: () => void;
    onScan: (barcode: IDetectedBarcode[]) => void;
}) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-sm w-full p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Scan Order QR</h3>
                    <Button onClick={onClose} className="p-1">
                        <XIcon size={20}/>
                    </Button>
                </div>
                <div className="w-full aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <Scanner
                        allowMultiple={true}
                        scanDelay={250}
                        paused={false}
                        onScan={(result) => {
                            onScan(result);
                            onClose();
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

const OrderManagerDashboard = () => {
    const queryClient = useQueryClient();
    const [inventory, setInventory] = useState<Map<string, number>>(new Map());
    const [searchFilter, setSearchFilter] = useState('');
    const [showScanner, setShowScanner] = useState(false);
    const [activeTab, setActiveTab] = useState<'active' | 'ready' | 'completed'>('active');

    const { data: orders, error, isFetching } = useOrders(5000);

    // Mutations
    const payMutation = useMutation({
        mutationFn: async (orderId: string) => {
            const isPaid = orders?.find((order) => order._id.toString() === orderId)?.isPaid ?? false;
            const response = await fetch(`/api/order/${orderId}/pay`, {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isPaid: !isPaid })
            });
            return response.json();
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
    });

    const updateOrderMutation = useMutation({
        mutationFn: async ({ orderId, order }: {
            orderId: string;
            order: OrderDocument
        }) => updateOrder(orderId, order),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
    });

    // Update inventory when orders change
    useEffect(() => {
        if (orders) {
            updateInventoryFromOrders(orders);
        }
    }, [orders]);

    function updateInventoryFromOrders(orders: OrderDocument[]) {
        const newInventory = new Map<string, number>();
        for (const order of orders) {
            if (order.status === ORDER_STATUSES.READY_FOR_PICKUP || order.status === ORDER_STATUSES.COMPLETED || order.status === ORDER_STATUSES.CANCELLED) {
                continue;
            }
            order.items.forEach(item => {
                if (item.status === ITEM_STATUSES.PREPPING || item.status === ITEM_STATUSES.READY_TO_COOK || item.status === ITEM_STATUSES.COOKING) {
                    const count = newInventory.get(item.item.name) ?? 0;
                    newInventory.set(item.item.name, count + 1);
                }
            });
        }
        setInventory(newInventory);
    }

    async function handleItemStatus(assignments: Map<string, number>, status: ItemStatus) {
        if (!orders) {
            return;
        }

        const ordersToUpdate = new Set<OrderDocument>();
        assignments.forEach((count, type) => {
            let remainingCount = count;

            for (const order of orders) {
                if (order.status === ORDER_STATUSES.COMPLETED || order.status === ORDER_STATUSES.CANCELLED) {
                    continue;
                }

                for (const item of order.items) {
                    if (item.item.name === type && remainingCount > 0 && item.status !== status) {
                        item.status = status;
                        remainingCount--;
                        ordersToUpdate.add(order);

                        if (remainingCount === 0) {
                            break;
                        }
                    }
                }
                if (remainingCount === 0) {
                    break;
                }
            }
        });

        // Update orders using mutation
        for (const order of Array.from(ordersToUpdate)) {
            updateOrderMutation.mutate({
                orderId: order._id.toString(),
                order
            });
        }
    }

    function markOrderDelivered(orderId: string) {
        const order = orders?.find(o => o._id.toString() === orderId);
        if (!order) {
            return;
        }

        const updatedOrder = {
            ...order,
            status: ORDER_STATUSES.COMPLETED,
            finishedAt: new UTCDate()
        } as OrderDocument;

        updateOrderMutation.mutate({ orderId, order: updatedOrder });
    }

    function handlePayment(orderId: string) {
        payMutation.mutate(orderId);
    }

    function handleBarcodeScan(barcode: IDetectedBarcode[]) {
        const linkToOrder = barcode[0].rawValue;
        const extractedId = linkToOrder.split('/').pop();
        if (extractedId) {
            setSearchFilter(extractedId);
        }
    }

    const filteredOrders = useMemo(() => {
        if (!orders) {
            return [];
        }

        let filtered = orders;

        // Tab filter
        if (activeTab === 'active') {
            filtered = filtered.filter(o =>
                o.status === ORDER_STATUSES.ORDERED ||
                o.status === ORDER_STATUSES.ACTIVE
            );
        } else if (activeTab === 'ready') {
            filtered = filtered.filter(o => o.status === ORDER_STATUSES.READY_FOR_PICKUP);
        } else if (activeTab === 'completed') {
            filtered = filtered.filter(o =>
                o.status === ORDER_STATUSES.COMPLETED ||
                o.status === ORDER_STATUSES.CANCELLED
            );
        }

        // Search filter
        if (searchFilter) {
            const search = searchFilter.toLowerCase();
            filtered = filtered.filter(order =>
                order.name.toLowerCase().includes(search) ||
                order._id.toString().includes(search) ||
                order.items.some(item =>
                    item.item.name.toLowerCase().includes(search) ||
                    item.item.dietary?.toLowerCase()?.includes(search)
                )
            );
        }

        // Sort by timeslot
        return filtered.sort((a, b) => {
            const timeA = timeslotToUTCDate(a.timeslot).getTime();
            const timeB = timeslotToUTCDate(b.timeslot).getTime();
            return timeA - timeB;
        });
    }, [orders, activeTab, searchFilter]);

    // Check for overdue orders
    const overdueOrders = useMemo(() => {
        const now = Date.now();
        return filteredOrders.filter(order =>
            (order.status !== ORDER_STATUSES.COMPLETED && order.status !== ORDER_STATUSES.CANCELLED) &&
            timeslotToUTCDate(order.timeslot).getTime() < now
        );
    }, [filteredOrders]);

    if (error) {
        return <ErrorMessage error={error.message}/>;
    }

    if (isFetching && !orders) {
        return <Loading/>;
    }

    return (
        <>
            <Heading title={"Order Manager"} description={"Handle all orders"}
                     icon={<Pizza className="w-8 h-8 text-orange-500"/>}>
                <div className="flex items-center gap-4">
                    <div className="w-64">
                        <SearchInput search={setSearchFilter} searchValue={searchFilter}/>
                    </div>
                    <Button
                        onClick={() => setShowScanner(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
                    >
                        <ScanIcon size={20}/>
                        Scan QR
                    </Button>
                </div>
            </Heading>

            {overdueOrders.length > 0 && (
                <div className="bg-red-100 border-2 border-red-300 rounded-xl p-4 mb-6 flex items-center gap-3">
                    <AlertTriangle className="w-6 h-6 text-red-600"/>
                    <span className="font-medium text-red-800">
                        {overdueOrders.length} order{overdueOrders.length > 1 ? 's' : ''} overdue!
                    </span>
                </div>
            )}

            <div className="mb-8">
                <PizzaInventory
                    inventory={inventory}
                    onChangeItemStatus={handleItemStatus}
                />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
                <div className="flex p-2">
                    <button
                        onClick={() => setActiveTab('active')}
                        className={`flex-1 px-4 py-2 font-medium rounded-lg transition-colors ${
                            activeTab === 'active'
                                ? 'bg-primary-100 text-primary-700'
                                : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        Active Orders
                    </button>
                    <button
                        onClick={() => setActiveTab('ready')}
                        className={`flex-1 px-4 py-2 font-medium rounded-lg transition-colors ${
                            activeTab === 'ready'
                                ? 'bg-green-100 text-green-700'
                                : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        Ready
                    </button>
                    <button
                        onClick={() => setActiveTab('completed')}
                        className={`flex-1 px-4 py-2 font-medium rounded-lg transition-colors ${
                            activeTab === 'completed'
                                ? 'bg-gray-100 text-gray-700'
                                : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        Completed
                    </button>
                </div>
            </div>

            {/* Orders Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredOrders.map(order => {
                    const now = Date.now();
                    const isOverdue = (order.status !== ORDER_STATUSES.COMPLETED && order.status !== ORDER_STATUSES.CANCELLED)
                        && timeslotToUTCDate(order.timeslot).getTime() < now;

                    return (
                        <OrderCard
                            key={order._id.toString()}
                            order={order}
                            isOverdue={isOverdue}
                            onPay={handlePayment}
                            onDeliver={markOrderDelivered}
                        />
                    );
                })}
            </div>

            {/* QR Scanner Modal */}
            <QRScannerModal
                isOpen={showScanner}
                onClose={() => setShowScanner(false)}
                onScan={handleBarcodeScan}
            />
        </>
    );
};

export default OrderManagerDashboard;
