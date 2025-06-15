import { useQuery } from "@tanstack/react-query";
import { System, SystemDocument } from "@/model/system";

const getSystem = async (): Promise<System> => {
    const response = await fetch('/api/system', {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store'
    })
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
