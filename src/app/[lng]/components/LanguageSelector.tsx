'use client';

import { useT } from '@/app/i18n/i18nClient';
import { i18nSettings } from "@/app/i18n/i18n";

interface LanguageSelectorProps {
    className?: string;
}

export default function LanguageSelector({ className = '' }: Readonly<LanguageSelectorProps>) {
    const { t, i18n } = useT();

    const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newLanguage = event.target.value;
        i18n.changeLanguage(newLanguage);
    };

    const getLanguageLabel = (lang: string): string => {
        const emoji = t('lang_emoji', { lng: lang });
        return emoji ? `${emoji} ${lang.toUpperCase()}` : lang.toUpperCase();
    };

    // Get available languages from your i18n config
    const availableLanguages = i18nSettings.languages

    return (
        <select
            value={i18n.language}
            onChange={handleLanguageChange}
            className={`
                rounded-full border border-gray-300 
                bg-white px-3 py-2 text-sm
                focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500
                ${className}
            `}
            aria-label="Select language"
        >
            {availableLanguages.map((lang) => (
                <option key={lang} value={lang}>
                    {getLanguageLabel(lang)}
                </option>
            ))}
        </select>
    );
}
