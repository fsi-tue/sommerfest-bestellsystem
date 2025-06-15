import { ItemDocument } from "@/model/item";
import { useQuery } from "@tanstack/react-query";

const getItems = async (): Promise<ItemDocument[]> => {
    const response = await fetch(`/api/pizza`, {
        method: 'GET',
        credentials: 'include',
    })
    return await response.json()
}

export function useItems(refetchInterval: number | false = false) {
    return useQuery({
        queryKey: ['items'],
        queryFn: () => getItems(),
        refetchInterval: refetchInterval
    })
}
