'use client'

import { useEffect, useState } from 'react'
import { useTranslation, UseTranslationOptions } from 'react-i18next'
import { useParams, usePathname } from 'next/navigation'
import i18next from "i18next";

export function useT(
    ns?: string | string[],
    options?: UseTranslationOptions<any>
) {
    const params = useParams()
    const pathname = usePathname()
    const [isClient, setIsClient] = useState(false)

    // Extract language from URL or use default
    const lng = (params?.lng as string) || extractLangFromPath(pathname) || 'en'

    const translation = useTranslation(ns, {
        ...options,
        lng
    })

    useEffect(() => {
        setIsClient(true)
    }, [])

    // Return safe defaults during SSR
    if (!isClient) {
        return {
            t: i18next.getFixedT(lng ?? i18next.resolvedLanguage, Array.isArray(ns) ? ns[0] : ns, options?.keyPrefix),
            i18n: i18next
        }
    }

    return translation
}

function extractLangFromPath(pathname: string): string | null {
    const segments = pathname.split('/')
    const supportedLangs = ['en', 'de', 'fr', 'it']
    return supportedLangs.includes(segments[1]) ? segments[1] : null
}
