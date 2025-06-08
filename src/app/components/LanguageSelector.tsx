'use client';

import { getUserLocale, setUserLocale } from "@/services/locale";
import React, { startTransition, useEffect } from "react";
import { Locale, locales } from "@/i18n/config";

interface LanguageSelectorProps {
    className?: string;
}

export default function LanguageSelector({ className = '' }: Readonly<LanguageSelectorProps>) {
    const [locale, setLocale] = React.useState<string>();

    useEffect(() => {
        getUserLocale().then(updatedLocale => setLocale(updatedLocale));
    }, []);

    function onChange(event: React.ChangeEvent<HTMLSelectElement>) {
        const locale = event.target.value as Locale;
        setLocale(locale);
        startTransition(() => {
            setUserLocale(locale);
        });
    }

    return (
        <select
            value={locale}
            onChange={onChange}
            className={`
                rounded-full border border-gray-300 
                bg-white px-3 py-2 text-sm
                focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500
                ${className}
            `}
            aria-label="Select language"
        >
            {locales.map((lang) => {
                return (
                    <option key={lang} value={lang}>
                        {lang}
                    </option>
                );
            })}
        </select>
    );
}
