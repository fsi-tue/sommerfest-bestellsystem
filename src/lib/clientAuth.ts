import { getCookieValue } from "@/lib/cookies";

export const getAuthToken = () => {
    return getCookieValue('auth-token')
}
