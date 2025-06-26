import { useQuery } from "@tanstack/react-query";
import { System, SystemDocument } from "@/model/system";

const getSystem = async (): Promise<System> => {
    const response = await fetch('/api/system', {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store'
    })
    if (!response.ok) {
        throw new Error(response.statusText);
    }
    const systemResponse = await response.json() as { system: SystemDocument }
    return systemResponse.system;
}

export function useSystem(refetchInterval: number | false = false) {
    return useQuery({
        queryKey: ['system'],
        queryFn: () => getSystem(),
        refetchInterval: refetchInterval
    })
}
