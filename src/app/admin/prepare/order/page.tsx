'use client'

import React, { useMemo, useState } from 'react';
import { CheckCircle, CheckIcon, Clock, ClockIcon, Pizza, QrCodeIcon, TriangleAlert, XCircle } from 'lucide-react';
import { Scanner } from "@yudiel/react-qr-scanner";
import { ORDER_STATUSES, OrderDocument } from '@/model/order';
import { ItemTicketDocumentWithItem, TICKET_STATUS } from '@/model/ticket';
import { timeslotToLocalTime } from '@/lib/time';
import SearchInput from '@/app/components/SearchInput';
import Button from '@/app/components/Button';
import { Heading } from "@/app/components/layout/Heading";
import ErrorMessage from "@/app/components/ErrorMessage";
import { Loading } from "@/app/components/Loading";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useOrders } from "@/lib/fetch/order";
import { useTickets } from "@/lib/fetch/ticket";
import { useTranslations } from "next-intl";

const TicketItem = ({ ticket, selectedTickets, handleToggleTicket, selectable = false }: {
    selectedTickets: Set<string>,
    ticket: ItemTicketDocumentWithItem;
    handleToggleTicket: (ticketId: string) => void;
    selectable?: boolean;
}) => {
    return (
        <div
            className={`group flex items-center justify-between p-2 rounded-xl transition-all duration-200 hover:shadow-md ${
                selectedTickets.has(ticket._id.toString())
                    ? ' bg-blue-50 border-blue-300 shadow-sm'
                    : 'bg-white border-gray-100 hover:border-gray-200'
            }`}>
            <div className="flex items-center gap-3">
                {selectable && (
                    <div className="relative">
                        <input
                            type="checkbox"
                            checked={selectedTickets.has(ticket._id.toString())}
                            onChange={() => handleToggleTicket(ticket._id.toString())}
                            className="w-5 h-5 rounded-md  border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2 transition-colors"
                        />
                    </div>
                )}
                <div className="flex flex-col">
                    <span className="font-semibold text-gray-900">{ticket.itemTypeRef.name}</span>
                </div>
            </div>
            <div className="flex items-center gap-2 mt-1">
                {ticket.orderId && (
                    <span
                        className="text-xs font-medium  bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full">
                    Order #{ticket.orderId.toString().slice(-6)}
                </span>
                )}
                {/* <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                    #{ticket._id.toString().slice(-6)}
                </span> */}
                {ticket.timeslot && (
                    <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
                                {timeslotToLocalTime(ticket.timeslot)}
                            </span>
                )}

            </div>
        </div>
    );
};

const ItemTracker = ({
                         tickets,
                         orders,
                         onMarkReady,
                         onAssignToOrder
                     }: {
    tickets: ItemTicketDocumentWithItem[];
    orders: OrderDocument[];
    onMarkReady: (ticketId: string) => void;
    onAssignToOrder: (ticketIds: string[], orderId: string) => void;
}) => {
    const [selectedTickets, setSelectedTickets] = useState<Set<string>>(new Set());
    const [assignMode, setAssignMode] = useState(false);
    const t = useTranslations();

    // Group tickets by status and type
    const ticketGroups = useMemo(() => {
        return {
            active: tickets.filter(t => t.status === TICKET_STATUS.ACTIVE),
            ready: tickets.filter(t => t.status === TICKET_STATUS.READY)
        };
    }, [tickets]);

    // Filter orders that need selected ticket types
    const compatibleOrders = useMemo(() => {
        if (selectedTickets.size === 0) {
            return [];
        }

        const selectedTypes = new Set<string>();
        selectedTickets.forEach(ticketId => {
            const ticket = tickets.find(t => t._id.toString() === ticketId);
            if (ticket) {
                selectedTypes.add(ticket.itemTypeRef._id.toString());
            }
        });

        return orders.filter(order => {
            if (order.status !== ORDER_STATUSES.ACTIVE && order.status !== ORDER_STATUSES.ORDERED && order.status !== ORDER_STATUSES.READY_FOR_PICKUP) {
                return false;
            }

            const orderTypes = order.items.map(item => item._id.toString());
            return Array.from(selectedTypes).some(type => orderTypes.includes(type));
        });
    }, [selectedTickets, tickets, orders]);

    const handleToggleTicket = (ticketId: string) => {
        const newSelected = new Set(selectedTickets);
        if (newSelected.has(ticketId)) {
            newSelected.delete(ticketId);
        } else {
            newSelected.add(ticketId);
        }
        setSelectedTickets(newSelected);
    };

    const handleAssign = (orderId: string) => {
        onAssignToOrder(Array.from(selectedTickets), orderId);
        setSelectedTickets(new Set());
        setAssignMode(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-xl text-gray-900">{t('Admin.OrderManager.ItemTracker.title')}</h3>
                {selectedTickets.size > 0 && (
                    <div className="flex gap-3">
                        <Button
                            onClick={() => setAssignMode(!assignMode)}
                            className=" bg-blue-500 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                            {assignMode ? t('Admin.OrderManager.Actions.cancel') : t('Admin.OrderManager.Actions.assignToOrder')}
                        </Button>
                        <Button
                            onClick={() => setSelectedTickets(new Set())}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200"
                        >
                            {t('Admin.OrderManager.Actions.clear')}
                        </Button>
                    </div>
                )}
            </div>

            {/* Active tickets */}
            <div className="bg-gradient-to-br bg-orange-50  border-orange-200 rounded-2xl p-6 shadow-sm">
                <h4 className="font-bold mb-4 text-orange-700 flex items-center gap-2 text-lg">
                    {t('Admin.OrderManager.ItemTracker.beingPrepared')}
                    <span className="bg-orange-200 text-orange-800 text-xs px-2 py-1 rounded-full font-medium">
                        {ticketGroups.active.length}
                    </span>
                </h4>
                <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
                    {ticketGroups.active.map(ticket => (
                        <div key={ticket._id.toString()} className="flex items-center justify-between">
                            <TicketItem ticket={ticket} selectedTickets={selectedTickets}
                                        handleToggleTicket={handleToggleTicket}/>
                            <Button
                                onClick={() => onMarkReady(ticket._id.toString())}
                                className=" bg-green-500 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md whitespace-nowrap"
                            >
                                <CheckIcon />
                            </Button>
                        </div>
                    ))}
                    {ticketGroups.active.length === 0 && (
                        <div className="text-center py-8">
                            <p className="text-gray-500 text-sm">No items being prepared</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Ready tickets (unassigned) */}
            <div className="bg-gradient-to-br bg-green-50  border-green-200 rounded-2xl p-6 shadow-sm">
                <h4 className="font-bold mb-4 text-green-700 flex items-center gap-2 text-lg">
                    {t('Admin.OrderManager.ItemTracker.readyForAssignment')}
                    <span className="bg-green-200 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                        {ticketGroups.ready.length}
                    </span>
                </h4>
                <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
                    {ticketGroups.ready.map(ticket => (
                        <TicketItem
                            key={ticket._id.toString()}
                            ticket={ticket}
                            selectable={true}
                            selectedTickets={selectedTickets}
                            handleToggleTicket={handleToggleTicket}/>
                    ))}
                    {ticketGroups.ready.length === 0 && (
                        <div className="text-center py-8">
                            <p className="text-gray-500 text-sm">{t('Admin.OrderManager.ItemTracker.noReadyItemsAvailable')}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Order assignment panel */}
            {assignMode && selectedTickets.size > 0 && (
                <div
                    className="bg-gradient-to-br bg-blue-50  border-blue-300 rounded-2xl p-6 shadow-lg animate-in slide-in-from-top duration-300">
                    <h4 className="font-bold mb-4 text-blue-800 text-lg">{t('Admin.OrderManager.ItemTracker.selectOrderToAssign')}</h4>
                    <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
                        {compatibleOrders.map(order => (
                            <div
                                key={order._id.toString()}
                                className="flex justify-between items-center p-4 bg-white rounded-xl  border-gray-100 hover:border-blue-300 cursor-pointer transition-all duration-200 hover:shadow-md group"
                                onClick={() => handleAssign(order._id.toString())}
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-semibold text-gray-900">{order.name}</span>
                                        <span
                                            className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                                            #{order._id.toString().slice(-6)}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        {order.items.map(i => i.name).join(', ')}
                                    </div>
                                </div>
                                <span
                                    className="text-sm  bg-gray-100 text-gray-700 px-3 py-2 rounded-lg font-medium">
                                    {timeslotToLocalTime(order.timeslot)}
                                </span>
                            </div>
                        ))}
                        {compatibleOrders.length === 0 && (
                            <div className="text-center py-8">
                                <p className="text-gray-500 text-sm">{t('Admin.OrderManager.ItemTracker.noCompatibleOrdersFound')}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// Order card with delivery functionality
const OrderCard = ({ order, tickets, onDeliver, onActive, onTogglePaid }: {
    order: OrderDocument;
    tickets: ItemTicketDocumentWithItem[];
    onDeliver: (ignoreTickets: boolean) => void;
    onActive: () => void;
    onTogglePaid: () => void;
}) => {
    const t = useTranslations()

    const [ignoreTickets, setIgnoreTickets] = useState(false);

    // Check if order can be delivered
    const requiredItems = useMemo(() => {
        // Count required items
        const requiredItems = new Map<string, number>();
        order.items.forEach(item => {
            const typeId = item._id.toString();
            requiredItems.set(typeId, (requiredItems.get(typeId) ?? 0) + 1);
        });
        return requiredItems;
    }, [order]);

    const availableItems = useMemo(() => {
        const availableItems = new Map<string, number>();
        tickets.forEach(ticket => {
            const typeId = ticket.itemTypeRef._id.toString();
            if (ticket.status === TICKET_STATUS.READY && (ticket.orderId?.toString() === order._id.toString() || !ticket.orderId)) {
                availableItems.set(typeId, (availableItems.get(typeId) ?? 0) + 1);
            }
        });
        return availableItems;
    }, [order, tickets]);

    const canDeliver = useMemo(() => {
        // Check if all required items are available
        for (const [typeId, required] of requiredItems.entries()) {
            if ((availableItems.get(typeId) ?? 0) < required) {
                return false;
            }
        }
        return true;
    }, [requiredItems, availableItems]);

    const isActive = order.status !== ORDER_STATUSES.COMPLETED && order.status !== ORDER_STATUSES.CANCELLED;

    return (
        <div className={`bg-white rounded-2xl  p-6 shadow-sm transition-all duration-200 ${
            !order.isPaid
                ? 'border-red-300 bg-gradient-to-br bg-red-50'
                : canDeliver
                    ? 'border-green-300 bg-gradient-to-br bg-green-50'
                    : 'border-gray-200'
        }`}>
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="font-bold text-xl text-gray-900 mb-1">{order.name}</h3>
                    <p className="text-sm font-mono bg-gray-100 text-gray-600 px-2 py-1 rounded-md w-fit">
                        #{order._id.toString().slice(-6)}
                    </p>
                </div>
                <div className="flex flex-row gap-2 items-end">
                    {!order.isPaid && (
                        <div
                            className=" bg-red-100 text-red-800 text-sm px-3 py-2 rounded-xl flex items-center gap-2 font-medium">
                            <TriangleAlert className="w-4 h-4"/>
                            {t('Admin.OrderManager.Orders.notPaid')}
                        </div>
                    )}
                    <div
                        className=" bg-gray-100 text-gray-700 text-sm px-3 py-2 rounded-xl flex items-center gap-2 font-medium">
                        <ClockIcon className="w-4 h-4"/>
                        {timeslotToLocalTime(order.timeslot)}
                    </div>
                    <div
                        className=" bg-gray-100 text-gray-700 text-sm px-3 py-2 rounded-xl flex items-center gap-2 font-medium">
                        {order.status}
                    </div>
                </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <div className="space-y-2">
                    {order.items.map((item, idx) => {
                        const itemId = item._id.toString();
                        const requiredCount = requiredItems.get(itemId) ?? 0;
                        const availableCount = availableItems.get(itemId) ?? 0;
                        const isFullyReady = availableCount >= requiredCount;

                        return (
                            <div key={`${itemId}-${idx}`}
                                 className="flex justify-between items-center text-sm">
                                <span className="font-medium text-gray-700">{item.name}</span>
                                <div className="flex items-center gap-2">
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                    isFullyReady
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {availableCount}/{requiredCount}
                                </span>
                                    {isFullyReady ? (
                                        <CheckCircle className="w-4 h-4 text-green-600"/>
                                    ) : (
                                        <Clock className="w-4 h-4 text-yellow-600"/>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="flex gap-3 items-center">
                {isActive && (
                    <>
                        <Button
                            onClick={() => onDeliver(ignoreTickets)}
                            className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-medium transition-all duration-200 ${
                                canDeliver
                                    ? ' bg-green-500 text-white shadow-sm hover:shadow-md'
                                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            }`}
                            disabled={!canDeliver && !ignoreTickets}
                        >
                            <CheckCircle className="w-5 h-5"/>
                            {t('Admin.OrderManager.Actions.deliverOrder')}
                        </Button>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={ignoreTickets}
                                onChange={() => setIgnoreTickets(!ignoreTickets)}
                                className="w-4 h-4 rounded  border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-xs text-gray-600">{t('Admin.OrderManager.Actions.force')}</span>
                        </div>
                    </>
                )}

                {!isActive && (
                    <>
                        <Button
                            onClick={() => onDeliver(ignoreTickets)}
                            className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-medium transition-all duration-200 bg-gray-200 text-gray-500}`}
                        >
                            <CheckCircle className="w-5 h-5"/>
                            {t('Admin.OrderManager.Actions.deliverOrder')}
                        </Button>
                    </>
                )}

                <Button
                    onClick={onTogglePaid}
                    className={`px-4 py-3 rounded-xl font-bold transition-all duration-200 ${
                        order.isPaid
                            ? 'bg-green-200 text-green-800 hover:bg-green-300'
                            : 'bg-red-200 text-red-800 hover:bg-red-300'
                    }`}
                >
                    {order.totalPrice}€
                </Button>
            </div>
        </div>
    );
};

// QR Scanner Modal
const QRScannerModal = ({ isOpen, onClose, onScan }: {
    isOpen: boolean;
    onClose: () => void;
    onScan: (code: string) => void;
}) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Scan Order QR</h3>
                    <Button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                        <XCircle className="w-6 h-6 text-gray-500"/>
                    </Button>
                </div>
                <div className="w-full aspect-square rounded-2xl overflow-hidden bg-gray-100  border-gray-200">
                    <Scanner
                        onScan={(result) => {
                            const code = result[0]?.rawValue;
                            if (code) {
                                onScan(code.split('/').pop() ?? code);
                                onClose();
                            }
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

// Main component
export default function OrderManagerDashboard() {
    const t = useTranslations()
    const queryClient = useQueryClient();
    const [searchFilter, setSearchFilter] = useState('');
    const [showScanner, setShowScanner] = useState(false);

    type Tabs = 'active' | 'completed';
    const [tab, setTab] = useState<Tabs>('active')

    const { data: orders, error: ordersError } = useOrders(5000);
    const { data: tickets, error: ticketsError } = useTickets(5000);

    // Mark ticket as ready mutation
    const markTicketReadyMutation = useMutation({
        mutationFn: async (ticketId: string) => {
            const response = await fetch(`/api/order/ticket/`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: ticketId, status: TICKET_STATUS.READY })
            });
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
        }
    });

    // Deliver order mutation
    const deliverOrderMutation = useMutation({
        mutationFn: async ({ id, ignoreTickets }: { id: string, ignoreTickets: boolean }) => {
            const response = await fetch(`/api/order/deliver`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: id, ignoreTickets: ignoreTickets })
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message ?? 'Failed to deliver order');
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
        }
    });

    const assignTicketsMutation = useMutation({
        mutationFn: async ({ ticketIds, orderId }: { ticketIds: string[]; orderId: string }) => {
            const promises = ticketIds.map(ticketId =>
                fetch(`/api/order/ticket`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: ticketId,
                        orderId: orderId
                    })
                })
            );
            return Promise.all(promises);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
            queryClient.invalidateQueries({ queryKey: ['orders'] });
        }
    });

    const togglePaidMutation = useMutation({
        mutationFn: async ({ order, isPaid }: { order: OrderDocument; isPaid: boolean }) => {
            const response = await fetch(`/api/order/`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: order._id.toString(), order: { isPaid: isPaid } })
            });
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
        }
    });

    const filteredOrders = useMemo(() => {
        if (!orders) {
            return [];
        }
        let filtered = orders

        if (tab === 'active') {
            filtered = filtered.filter(o =>
                o.status !== ORDER_STATUSES.COMPLETED &&
                o.status !== ORDER_STATUSES.CANCELLED
            );
        } else if (tab === 'completed') {
            filtered = filtered.filter(o =>
                o.status === ORDER_STATUSES.COMPLETED ||
                o.status === ORDER_STATUSES.CANCELLED
            );
        }

        if (searchFilter) {
            const search = searchFilter.toLowerCase();
            filtered = filtered.filter(order =>
                order.name.toLowerCase().includes(search) ||
                order._id.toString().includes(search)
            );
        }

        return filtered.sort((a, b) => a.timeslot.localeCompare(b.timeslot));
    }, [tab, orders, searchFilter]);

    if (ordersError || ticketsError) {
        return <ErrorMessage error={(ordersError?.message ?? ticketsError?.message) ?? 'Error'}/>;
    }

    if (!orders || !tickets) {
        return <Loading/>;
    }

    return (
        <>
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }

                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f5f9;
                    border-radius: 3px;
                }

                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 3px;
                }

                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
            `}</style>

            <Heading
                title={t('Admin.OrderManager.title')}
                description={t('Admin.OrderManager.description')}
                icon={<Pizza className="w-8 h-8 text-orange-500"/>}
            >
                <div className="flex gap-3 items-center">
                    <SearchInput
                        search={setSearchFilter}
                        searchValue={searchFilter}
                    />
                    <Button
                        onClick={() => setShowScanner(true)}
                        className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                        <QrCodeIcon className="w-6 h-6"/>
                    </Button>
                </div>
            </Heading>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl p-6 shadow-sm  border-gray-100 sticky top-4">
                        <ItemTracker
                            tickets={tickets}
                            orders={orders}
                            onMarkReady={(ticketId) => markTicketReadyMutation.mutate(ticketId)}
                            onAssignToOrder={(ticketIds, orderId) => assignTicketsMutation.mutate({
                                ticketIds,
                                orderId
                            })}
                        />
                    </div>
                </div>

                {/* Orders */}
                <div className="lg:col-span-1">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 bg-white rounded-2xl p-6 shadow-sm  border-gray-100">
                            <Button
                                className={`border-2 p-2 rounded-xl ${tab === 'active' ? 'border-primary-50 bg-primary-200' : ''}`}
                                onClick={() => setTab('active')}>
                                {t('Admin.OrderManager.Orders.activeOrders')}
                            </Button>
                            <Button
                                className={`border-2 p-2 rounded-xl ${tab === 'completed' ? 'border-primary-50 bg-primary-200' : ''}`}
                                onClick={() => setTab('completed')}>
                                {t('Admin.OrderManager.Orders.completedOrders')}
                            </Button>
                        </div>
                        <div className=" bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full font-medium w-fit">
                            {filteredOrders.length}
                        </div>
                        <div className="space-y-4">
                            {filteredOrders.map(order => (
                                <OrderCard
                                    key={order._id.toString()}
                                    order={order}
                                    tickets={tickets}
                                    onDeliver={(ignoreTickets: boolean) => deliverOrderMutation.mutate({
                                        id: order._id.toString(),
                                        ignoreTickets
                                    })}
                                    onTogglePaid={() => togglePaidMutation.mutate({
                                        order: order,
                                        isPaid: !order.isPaid
                                    })} onActive={function (): void {
                                    throw new Error('Function not implemented.');
                                }}/>
                            ))}
                        </div>
                        {filteredOrders.length === 0 && (
                            <div className="text-center py-12 bg-gray-50 rounded-2xl  border-dashed border-gray-200">
                                <p className="text-gray-500 text-lg">{t('Admin.OrderManager.Orders.noActiveOrders')}</p>
                                <p className="text-gray-400 text-sm mt-1">{t('Admin.OrderManager.Orders.ordersWillAppearHere')}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <QRScannerModal
                isOpen={showScanner}
                onClose={() => setShowScanner(false)}
                onScan={setSearchFilter}
            />
        </>
    );
}
