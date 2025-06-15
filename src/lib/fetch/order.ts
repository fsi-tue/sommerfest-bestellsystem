import { OrderDocument } from "@/model/order";
import { useQuery } from "@tanstack/react-query";

export const getOrders = async (): Promise<OrderDocument[]> => {
    const response = await fetch('/api/order', {
        method: 'GET',
        credentials: 'include',
    });
    return await response.json();
}

export const updateOrder = async (orderId: string, order: OrderDocument) => {
    const response = await fetch('/api/order', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, order })
    });
    return await response.json();
}

export function useOrders(refetchInterval: number | false = false) {
    return useQuery({
        queryKey: ['orders'],
        queryFn: () => getOrders(),
        refetchInterval: refetchInterval
    })
}
