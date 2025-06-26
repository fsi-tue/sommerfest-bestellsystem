'use client'

import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Clock, Trash2, X } from 'lucide-react';
import { Heading } from "@/app/components/layout/Heading";
import { useTranslations } from 'next-intl';
import { timeslotToDate, timeslotToLocalTime } from "@/lib/time";
import { useItems } from "@/lib/fetch/item";
import { Loading } from "@/app/components/Loading";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteTicket, updateTicket, useTickets } from "@/lib/fetch/ticket";
import { ItemTicketDocumentWithItem, TICKET_STATUS, TicketStatus } from "@/model/ticket";
import Button from '@/app/components/Button';
import SearchInput from "@/app/components/SearchInput";

const PizzaMakerStation = () => {
    const queryClient = useQueryClient();
    const [upcomingItems, setUpcomingItems] = useState<Map<string, number>>(new Map());
    const [error, setError] = useState('');
    const [filterText, setFilterText] = useState('');
    const [selectedTickets, setSelectedTickets] = useState<Set<string>>(new Set());

    const t = useTranslations();

    const { data: items, error: itemsError, isFetching: isFetchingItems } = useItems()
    const { data: tickets, error: ticketsError } = useTickets(5000)

    // Calculate what items need to be made
    const calculateUpcomingItems = (tickets: ItemTicketDocumentWithItem[]) => {
        const itemCount = new Map<string, number>();
        for (const ticket of tickets) {
            if (ticket.status === TICKET_STATUS.DEMANDED) {
                const key = ticket.itemTypeRef._id.toString()
                itemCount.set(key, (itemCount.get(key) ?? 0) + 1);
            }
        }
        setUpcomingItems(itemCount);
    };

    const updateTicketMutation = useMutation({
        mutationFn: async ({ ticketId, status }: {
            ticketId: string;
            status: TicketStatus;
        }) => updateTicket(ticketId, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
            setSelectedTickets(new Set()); // Clear selection after action
        },
        onError: (error) => {
            setError(error.message);
        },
    });

    const deleteTicketMutation = useMutation({
        mutationFn: async (ticketId: string) => deleteTicket(ticketId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
            setSelectedTickets(new Set());
        },
        onError: (error) => {
            setError(error.message);
        }
    });

    // Filter tickets based on search text
    const filteredTickets = useMemo(() => {
        if (!tickets) {
            return [];
        }
        const searchText = filterText.toLowerCase();
        return tickets.filter(ticket => {
            return (
                ticket.status !== TICKET_STATUS.CANCELLED_WASTE && ticket.status !== TICKET_STATUS.COMPLETED && (
                    ticket.itemTypeRef.name.toLowerCase().includes(searchText) ||
                    ticket.orderId?.toString().toLowerCase().includes(searchText) ||
                    ticket.timeslot && timeslotToLocalTime(ticket.timeslot)?.toLowerCase().includes(searchText)
                )
            );
        });
    }, [tickets, filterText]);

    useEffect(() => {
        if (filteredTickets) {
            const demandedTickets = filteredTickets.filter((ticket) => ticket.status === TICKET_STATUS.DEMANDED)
            calculateUpcomingItems(demandedTickets);
        }
    }, [items, filteredTickets]);

    useEffect(() => {
        if (itemsError) {
            setError(itemsError.message)
        } else if (ticketsError) {
            setError(ticketsError.message)
        }
    }, [ticketsError, itemsError]);

    if (isFetchingItems) {
        return <Loading message={t('loading_menu')}/>
    }

    if (!items || !tickets) {
        return null;
    }

    // Mark items as ready (ready to cook)
    const markItemReady = async (itemId: string) => {
        const item = items.find((it) => it._id.toString() === itemId);
        if (!item) {
            console.error('Item not found');
            return;
        }

        // Find the first order that needs this item type
        for (const ticket of filteredTickets) {
            // Exclude all orders that are not ordered or not active
            if (ticket.status !== TICKET_STATUS.DEMANDED) {
                console.log(ticket.itemTypeRef._id.toString())
                continue;
            }

            if (ticket.status === TICKET_STATUS.DEMANDED && ticket.itemTypeRef._id.toString() === itemId) {
                updateTicketMutation.mutate({
                    ticketId: ticket._id.toString(),
                    status: TICKET_STATUS.ACTIVE
                });
                break;
            }
        }
    };

    // Toggle ticket selection
    const toggleTicketSelection = (ticketId: string) => {
        const newSelection = new Set(selectedTickets);
        if (newSelection.has(ticketId)) {
            newSelection.delete(ticketId);
        } else {
            newSelection.add(ticketId);
        }
        setSelectedTickets(newSelection);
    };

    // Mark selected tickets as not ready (DEMANDED)
    const markSelectedNotReady = () => {
        selectedTickets.forEach(ticketId => {
            updateTicketMutation.mutate({
                ticketId,
                status: TICKET_STATUS.DEMANDED
            });
        });
    };

    // Mark selected tickets as ready (ACTIVE)
    const markSelectedReady = () => {
        selectedTickets.forEach(ticketId => {
            updateTicketMutation.mutate({
                ticketId,
                status: TICKET_STATUS.ACTIVE
            });
        });
    };

    // Delete selected tickets
    const deleteSelectedTickets = () => {
        if (window.confirm(`Are you sure you want to delete ${selectedTickets.size} ticket(s)?`)) {
            selectedTickets.forEach(ticketId => {
                deleteTicketMutation.mutate(ticketId);
            });
        }
    };

    return (
        <>
            <Heading
                title={t('Admin.Prepare.title')}
                description={t('Admin.Prepare.subtitle')}
                icon={<Clock className="w-10 h-10 text-gray-900"/>}
            />

            <div className="flex flex-col lg:flex-row gap-6 mt-6">
                {/* Left Panel - Orders Management */}
                <div className="bg-white p-6 rounded-2xl w-full lg:w-1/3 shadow-lg">
                    {/* Filter orders */}
                    <div className="mb-6">
                        <SearchInput
                            search={setFilterText}
                            searchValue={filterText}
                        />
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col gap-3 mb-6">
                        <Button
                            onClick={markSelectedReady}
                            disabled={selectedTickets.size === 0}
                            className="w-full py-4 text-lg font-semibold bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-xl"
                        >
                            Mark Ready ({selectedTickets.size})
                        </Button>

                        <Button
                            onClick={markSelectedNotReady}
                            disabled={selectedTickets.size === 0}
                            className="w-full py-4 text-lg font-semibold bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-xl"
                        >
                            Mark Not Ready ({selectedTickets.size})
                        </Button>

                        <Button
                            onClick={deleteSelectedTickets}
                            disabled={selectedTickets.size === 0}
                            className="w-full py-4 text-lg font-semibold bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-xl flex items-center justify-center gap-2"
                        >
                            <Trash2 className="w-5 h-5"/>
                            Delete Tickets ({selectedTickets.size})
                        </Button>
                    </div>

                    {/* Tickets List */}
                    <div className="flex flex-col gap-3 max-h-[20rem] lg:max-h-[30rem] overflow-y-auto">
                        {filteredTickets.toSorted((a, b) => {
                            if (a.status === TICKET_STATUS.DEMANDED && b.status === TICKET_STATUS.DEMANDED) {
                                return (timeslotToDate(a.timeslot)?.getTime() || 0) - (timeslotToDate(b.timeslot)?.getTime() || 0)
                            } else if (a.status === TICKET_STATUS.DEMANDED) {
                                return -1
                            } else if (b.status === TICKET_STATUS.DEMANDED) {
                                return 1
                            }
                            return (timeslotToDate(a.timeslot)?.getTime() || 0) - (timeslotToDate(b.timeslot)?.getTime() || 0)
                        }).map(ticket => (
                            <button
                                key={`${ticket._id.toString()}-${ticket.status}`}
                                onClick={() => toggleTicketSelection(ticket._id.toString())}
                                className={`
                                    border-2 px-4 py-3 rounded-xl text-base flex items-center justify-between cursor-pointer
                                    transition-all duration-200 hover:shadow-md
                                    ${ticket.status !== TICKET_STATUS.DEMANDED && !selectedTickets.has(ticket._id.toString())
                                    ? 'bg-green-50 border-green-200 text-gray-600'
                                    : 'bg-white'
                                }
                                    ${ticket.status !== TICKET_STATUS.DEMANDED && selectedTickets.has(ticket._id.toString())
                                    ? 'border-blue-500 border-green-200 text-gray-600'
                                    : 'bg-white'
                                }
                                    ${selectedTickets.has(ticket._id.toString()) ? 'border-blue-500' : 'border-gray-200 hover:border-gray-300'}
                                `}
                            >
                                <div className="flex flex-col">
                                    <span className="font-semibold">{ticket.itemTypeRef.name}</span>
                                    {ticket?.orderId && (
                                        <span
                                            className="text-sm text-gray-500">Order: {ticket.orderId.toString().slice(-6)}</span>
                                    )}
                                </div>
                                {ticket.timeslot && (
                                    <span className="bg-gray-100 py-1 px-3 rounded-full text-sm font-medium">
                                        {timeslotToLocalTime(ticket.timeslot)}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {upcomingItems.size === 0 && (
                        <div className="text-center py-8">
                            <span className="text-gray-400 text-lg">{t('Admin.Prepare.no_open_orders')} 🎉</span>
                        </div>
                    )}
                </div>

                {/* Right Panel - Items buttons grid */}
                <div className="flex-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {items.map(item => {
                            const pendingCount = upcomingItems.get(item._id.toString()) ?? 0;

                            return (
                                <Button
                                    rateLimitMs={1000}
                                    key={`${item.id}-${item.name}`}
                                    className={`
                                        aspect-square bg-gradient-to-br from-orange-400 to-red-500 
                                        rounded-3xl p-6 shadow-xl transform transition-all duration-200
                                        min-h-[120px] sm:min-h-[150px] lg:min-h-[180px]
                                        ${pendingCount > 0
                                        ? 'hover:scale-105 active:scale-95 cursor-pointer hover:shadow-2xl'
                                        : 'opacity-50 cursor-not-allowed grayscale'
                                    }
                                    `}
                                    onClick={() => pendingCount > 0 && markItemReady(item._id.toString())}
                                    disabled={pendingCount === 0}
                                >
                                    <div className="flex flex-col items-center justify-center h-full text-center">
                                        <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2">
                                            {item.name}
                                        </h3>
                                        {item.dietary && (
                                            <span className="text-sm text-white opacity-90 mb-3">
                                                {item.dietary}
                                            </span>
                                        )}
                                        {pendingCount > 0 && (
                                            <div
                                                className="bg-white bg-opacity-25 rounded-2xl px-4 py-2 backdrop-blur-sm">
                                                <span className="text-lg font-bold text-black">
                                                    {pendingCount} needed
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </Button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Error Toast */}
            {error && (
                <div
                    className="fixed bottom-8 right-8 bg-red-500 text-white rounded-xl px-6 py-4 flex items-center gap-3 shadow-2xl z-50">
                    <AlertCircle className="w-6 h-6"/>
                    <span className="font-medium">{error}</span>
                    <button
                        onClick={() => setError('')}
                        className="ml-2 text-white hover:text-gray-200"
                    >
                        <X className="w-5 h-5"/>
                    </button>
                </div>
            )}
        </>
    );
};

export default PizzaMakerStation;
