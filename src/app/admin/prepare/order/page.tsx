'use client'

import React, { useMemo, useState } from 'react';
import { CheckCircle, ClockIcon, Pizza, ScanIcon, TriangleAlert, XCircle } from 'lucide-react';
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


const TicketItem = ({ ticket, selectedTickets, handleToggleTicket, selectable = false }: {
    selectedTickets: Set<string>,
    ticket: ItemTicketDocumentWithItem;
    handleToggleTicket: (ticketId: string) => void;
    selectable?: boolean;
}) => (
    <div className={`flex items-center justify-between p-2 rounded border ${
        selectedTickets.has(ticket._id.toString())
            ? 'bg-blue-50 border-blue-300'
            : 'bg-white border-gray-200'
    }`}>
        <div className="flex items-center gap-2">
            {selectable && (
                <input
                    type="checkbox"
                    checked={selectedTickets.has(ticket._id.toString())}
                    onChange={() => handleToggleTicket(ticket._id.toString())}
                    className="w-4 h-4"
                />
            )}
            <div>
                <span className="font-medium">{ticket.itemTypeRef.name}</span>
                <span className="text-xs text-gray-500 ml-2">
                        #{ticket._id.toString().slice(-6)}
                    </span>
                {ticket.timeslot && (
                    <span className="text-xs text-gray-400 ml-2">
                            {timeslotToLocalTime(ticket.timeslot)}
                        </span>
                )}
            </div>
        </div>
        {ticket.orderId && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    Order #{ticket.orderId.toString().slice(-6)}
                </span>
        )}
    </div>
);

const TicketTracker = ({
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
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="font-semibold text-lg">Item Tracker</h3>
                {selectedTickets.size > 0 && (
                    <div className="flex gap-2">
                        <Button
                            onClick={() => setAssignMode(!assignMode)}
                            className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                        >
                            {assignMode ? 'Cancel' : 'Assign to Order'}
                        </Button>
                        <Button
                            onClick={() => setSelectedTickets(new Set())}
                            className="bg-gray-500 text-white px-3 py-1 rounded text-sm"
                        >
                            Clear
                        </Button>
                    </div>
                )}
            </div>

            {/* Active tickets */}
            <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-3 text-orange-600">🔥 Being Prepared</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                    {ticketGroups.active.map(ticket => (
                        <div key={ticket._id.toString()} className="flex items-center gap-2">
                            <TicketItem ticket={ticket} selectedTickets={selectedTickets}
                                        handleToggleTicket={handleToggleTicket}/>
                            <Button
                                onClick={() => onMarkReady(ticket._id.toString())}
                                className="bg-green-500 text-white px-2 py-1 rounded text-xs"
                            >
                                Ready
                            </Button>
                        </div>
                    ))}
                    {ticketGroups.active.length === 0 && (
                        <p className="text-gray-500 text-sm">No items</p>
                    )}
                </div>
            </div>

            {/* Ready tickets (unassigned) */}
            <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-3 text-green-600">✅ Ready</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                    {ticketGroups.ready.map(ticket => (
                        <TicketItem
                            key={ticket._id.toString()}
                            ticket={ticket}
                            selectable={true}
                            selectedTickets={selectedTickets}
                            handleToggleTicket={handleToggleTicket}/>
                    ))}
                    {ticketGroups.ready.length === 0 && (
                        <p className="text-gray-500 text-sm">No unassigned ready items</p>
                    )}
                </div>
            </div>

            {/* Order assignment panel */}
            {assignMode && selectedTickets.size > 0 && (
                <div className="border-2 border-blue-400 rounded-lg p-4 bg-blue-50">
                    <h4 className="font-medium mb-3">Select Order to Assign</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                        {compatibleOrders.map(order => (
                            <div
                                key={order._id.toString()}
                                className="flex justify-between items-center p-2 bg-white rounded border hover:border-blue-400 cursor-pointer"
                                onClick={() => handleAssign(order._id.toString())}
                            >
                                <div>
                                    <span className="font-medium">{order.name}</span>
                                    <span className="text-xs text-gray-500 ml-2">
                                        #{order._id.toString().slice(-6)}
                                    </span>
                                    <div className="text-xs text-gray-600">
                                        {order.items.map(i => i.name).join(', ')}
                                    </div>
                                </div>
                                <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                                    {timeslotToLocalTime(order.timeslot)}
                                </span>
                            </div>
                        ))}
                        {compatibleOrders.length === 0 && (
                            <p className="text-gray-500 text-sm">No compatible orders found</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// Order card with delivery functionality
const DeliveryOrderCard = ({ order, tickets, onDeliver, onTogglePaid }: {
    order: OrderDocument;
    tickets: ItemTicketDocumentWithItem[];
    onDeliver: (ignoreTickets: boolean) => void;
    onTogglePaid: () => void;
}) => {
    const [ignoreTickets, setIgnoreTickets] = useState(false);

    // Check if order can be delivered
    const canDeliver = useMemo(() => {
        // Count required items
        const requiredItems = new Map<string, number>();
        order.items.forEach(item => {
            const typeId = item._id.toString();
            requiredItems.set(typeId, (requiredItems.get(typeId) ?? 0) + 1);
        });

        // Count available tickets (assigned to this order or ready unassigned)
        const availableItems = new Map<string, number>();
        tickets.forEach(ticket => {
            const typeId = ticket.itemTypeRef._id.toString();
            if (ticket.status === TICKET_STATUS.READY && (ticket.orderId?.toString() === order._id.toString() || !ticket.orderId)) {
                availableItems.set(typeId, (availableItems.get(typeId) ?? 0) + 1);
            }
        });

        // Check if all required items are available
        for (const [typeId, required] of requiredItems.entries()) {
            if ((availableItems.get(typeId) ?? 0) < required) {
                return false;
            }
        }
        return true;
    }, [order, tickets]);

    const isActive = order.status !== ORDER_STATUSES.COMPLETED && order.status !== ORDER_STATUSES.CANCELLED;

    return (
        <div className={`bg-white rounded-lg border-2 p-4 ${
            !order.isPaid ? 'border-red-400' : canDeliver ? 'border-green-400' : 'border-gray-200'
        }`}>
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className="font-bold">{order.name}</h3>
                    <p className="text-sm text-gray-500">#{order._id.toString().slice(-6)}</p>
                </div>
                <div className="flex flex-row gap-1 items-center">
                    {!order.isPaid && (
                        <div
                            className="bg-red-50 text-red-700 text-sm p-2 rounded-xl w-fit flex flex-row gap-1 items-center">
                            <TriangleAlert/> Not Paid
                        </div>
                    )}
                    <div className="bg-gray-100 text-sm p-2 rounded-xl w-fit flex flex-row gap-1 items-center">
                        <ClockIcon/> {timeslotToLocalTime(order.timeslot)}
                    </div>
                </div>
            </div>

            <div className="space-y-1 mb-3">
                {order.items.map((item, idx) => (
                    <div key={`${item._id.toString()}-${idx}`} className="text-sm flex justify-between">
                        <span>{item.name}</span>
                    </div>
                ))}
            </div>

            {isActive && (
                <div className="flex gap-2">
                    <Button
                        onClick={() => onDeliver(ignoreTickets)}
                        className={`flex-1 py-2 rounded flex items-center gap-1 ${
                            canDeliver
                                ? 'bg-green-500 text-white hover:bg-green-600'
                                : 'bg-gray-300 text-gray-500'
                        }`}
                    >
                        <CheckCircle className="w-4 h-4 mr-1"/>
                        Deliver
                    </Button>
                    <input type="checkbox" checked={ignoreTickets} onChange={() => setIgnoreTickets(!ignoreTickets)}/>
                    <Button
                        onClick={onTogglePaid}
                        className={`px-3 py-2 rounded ${
                            order.isPaid
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                        }`}
                    >
                        {order.totalPrice}€
                    </Button>
                </div>
            )}

            {!isActive && (
                <div className={`text-center py-2 rounded ${
                    order.status === ORDER_STATUSES.COMPLETED
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                }`}>
                    {order.status}
                </div>
            )}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-sm w-full p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Scan Order QR</h3>
                    <Button onClick={onClose} className="p-1">
                        <XCircle className="w-5 h-5"/>
                    </Button>
                </div>
                <div className="w-full aspect-square rounded-lg overflow-hidden bg-gray-100">
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
    const queryClient = useQueryClient();
    const [searchFilter, setSearchFilter] = useState('');
    const [showScanner, setShowScanner] = useState(false);

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
                body: JSON.stringify({ id: order._id.toString(), order: { ...order, isPaid: isPaid } })
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

        let filtered = orders.filter(o =>
            o.status !== ORDER_STATUSES.COMPLETED &&
            o.status !== ORDER_STATUSES.CANCELLED
        );

        if (searchFilter) {
            const search = searchFilter.toLowerCase();
            filtered = filtered.filter(order =>
                order.name.toLowerCase().includes(search) ||
                order._id.toString().includes(search)
            );
        }

        return filtered.sort((a, b) => a.timeslot.localeCompare(b.timeslot));
    }, [orders, searchFilter]);

    if (ordersError || ticketsError) {
        return <ErrorMessage error={(ordersError?.message ?? ticketsError?.message) ?? 'Error'}/>;
    }

    if (!orders || !tickets) {
        return <Loading/>;
    }

    return (
        <>
            <Heading
                title="Delivery Station"
                description="Track items and deliver orders"
                icon={<Pizza className="w-8 h-8 text-orange-500"/>}
            >
                <div className="flex gap-2 items-center">
                    <SearchInput
                        search={setSearchFilter}
                        searchValue={searchFilter}
                    />
                    <Button
                        onClick={() => setShowScanner(true)}
                        className="bg-primary-500 text-white px-4 py-2 rounded hover:bg-primary-600"
                    >
                        <ScanIcon className="w-4 h-4"/>
                    </Button>
                </div>
            </Heading>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl p-6 shadow-sm border sticky top-4">
                        <TicketTracker
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
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Active Orders</h3>
                        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                            {filteredOrders.map(order => (
                                <DeliveryOrderCard
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
                                    })}
                                />
                            ))}
                        </div>
                        {filteredOrders.length === 0 && (
                            <p className="text-gray-500 text-center py-8">No active orders</p>
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
