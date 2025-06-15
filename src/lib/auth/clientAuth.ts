import { getCookieValue } from "@/lib/auth/cookies";

export const getAuthToken = () => {
    return getCookieValue('auth-token')
}
