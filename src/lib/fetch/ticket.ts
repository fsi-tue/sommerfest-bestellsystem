import { useQuery } from "@tanstack/react-query";
import { ItemTicketDocumentWithItem, TicketStatus } from "@/model/ticket";

export const getTickets = async (): Promise<ItemTicketDocumentWithItem[]> => {
    const response = await fetch('/api/order/ticket', {
        method: 'GET',
        credentials: 'include',
    });
    return await response.json();
}

export const updateTicket = async (ticketId: string, status: TicketStatus) => {
    const response = await fetch('/api/order/ticket', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: ticketId, status })
    });
    return await response.json();
}

export const deleteTicket = async (ticketId: string) => {
    const response = await fetch('/api/order/ticket', {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: ticketId })
    });
    return await response.json();
}

export function useTickets(refetchInterval: number | false = false) {
    return useQuery({
        queryKey: ['tickets'],
        queryFn: () => getTickets(),
        refetchInterval: refetchInterval
    })
}
