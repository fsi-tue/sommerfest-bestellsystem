'use client'

import React, { useEffect, useState } from 'react';
import { AlertCircle, Clock } from 'lucide-react';
import { Heading } from "@/app/components/layout/Heading";
import { useTranslations } from 'next-intl';
import { timeslotToDate, timeslotToLocalTime } from "@/lib/time";
import { useItems } from "@/lib/fetch/item";
import { Loading } from "@/app/components/Loading";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTicket, useTickets } from "@/lib/fetch/ticket";
import { ItemTicketDocumentWithItem, TICKET_STATUS } from "@/model/ticket";

const PizzaMakerStation = () => {
    const queryClient = useQueryClient();
    const [upcomingItems, setUpcomingItems] = useState<Map<string, number>>(new Map());
    const [error, setError] = useState('');

    const t = useTranslations();

    const { data: items, error: itemsError, isFetching: isFetchingItems } = useItems()
    const { data: tickets, error: ticketsError } = useTickets(5000)

    const updateTicketMutation = useMutation({
        mutationFn: async ({ ticketId }: {
            ticketId: string;
        }) => updateTicket(ticketId, TICKET_STATUS.ACTIVE),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tickets'] }),
    });
    useEffect(() => {
        if (tickets) {
            const filteredTickets = tickets.filter((ticket) => ticket.status === TICKET_STATUS.DEMANDED)
            calculateUpcomingItems(filteredTickets);
        }
    }, [items, tickets]);
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

    // Mark items as ready (ready to cook)
    const markItemReady = async (itemId: string) => {
        const item = items.find((it) => it._id.toString() === itemId);
        if (!item) {
            console.error('Item not found');
            return;
        }

        // Find the first order that needs this item type
        for (const ticket of tickets) {
            // Exclude all orders that are not ordered or not active
            if (ticket.status !== TICKET_STATUS.DEMANDED) {
                console.log(ticket.itemTypeRef._id.toString())
                continue;
            }

            if (ticket.status === TICKET_STATUS.DEMANDED && ticket.itemTypeRef._id.toString() === itemId) {
                updateTicketMutation.mutate({ ticketId: ticket._id.toString() })
                break;
            }
        }
    };

    return (
        <div>
            <Heading title={t('admin.prepare.title')} description={t('admin.prepare.subtitle')}
                     icon={<Clock className="w-10 h-10 text-gray-900"/>}/>


            <div className="flex flex-col md:flex-row gap-5">
                <div className="bg-white p-4 md:p-8 rounded-2xl w-full md:w-1/3">
                    <div className="flex flex-col gap-2 max-h-[15rem] md:max-h-fit overflow-y-scroll">
                        {tickets.toSorted((a, b) => {
                            if (a.status === TICKET_STATUS.DEMANDED && b.status === TICKET_STATUS.DEMANDED) {
                                return timeslotToDate(a.timeslot)?.getTime() - timeslotToDate(b.timeslot)?.getTime()
                            } else if (a.status === TICKET_STATUS.DEMANDED) {
                                return -1
                            } else if (b.status === TICKET_STATUS.DEMANDED) {
                                return 1
                            }
                            return timeslotToDate(a.timeslot)?.getTime() - timeslotToDate(b.timeslot)?.getTime()
                        }).slice(0, 10).map(ticket => (
                            <div
                                key={`${ticket._id.toString()}-${ticket.status}`}
                                className={`border px-3 py-1 rounded-lg text-sm flex items-center justify-between ${ticket.status !== TICKET_STATUS.DEMANDED ? 'bg-green-50 border-green-100 text-gray-400' : ''}`}>
                                {ticket.itemTypeRef.name}
                                {ticket.timeslot && <span className="bg-gray-100 py-0.5 px-1  rounded-2xl">
                                                {timeslotToLocalTime(ticket.timeslot)}
                                            </span>}
                            </div>
                        ))}
                    </div>
                    {upcomingItems.size === 0 && (
                        <span className="text-gray-400">{t('admin.prepare.no_open_orders')} 🎉</span>
                    )}
                </div>

                {/* Items buttons grid */}
                <div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                        {items.map(item => {
                            const pendingCount = upcomingItems.get(item._id.toString()) ?? 0;

                            return (
                                <button
                                    key={`${item.id}-${item.name}`}
                                    className={`
                aspect-4/3 bg-opacity-90 rounded-3xl p-3 md:p-4 
                shadow-2xl transform transition-all duration-200
                ${pendingCount > 0 ? 'hover:scale-105 active:scale-95 cursor-pointer' : 'opacity-50 cursor-not-allowed'}
              `}
                                    onClick={() => pendingCount > 0 && markItemReady(item._id.toString())}
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
