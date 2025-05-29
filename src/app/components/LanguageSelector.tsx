import { i18n } from "i18next";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface LanguageSelectorArgs {
    languages: string[];
};

const defaultEmoji = "🌐";

export default function LanguageSelector(options: LanguageSelectorArgs) {
    const [menuOpen, setMenuOpen] = useState(false);
    const { t, i18n } = useTranslation();


    function resolveLocale(emoji: string): string {
        // Generate a lookup object like: { en: "🇬🇧", de: "🇩🇪", ... }
        const emojiLookup: Record<string, string> = Object.fromEntries(
            i18n.languages.map((lang: string) => [
                lang,
                t('lang_emoji', { lng: lang }),
            ])
        );
        return Object.keys(emojiLookup).find(key => emojiLookup[key] === emoji) || "";
    }


    const handleLanguageChange = (event: React.MouseEvent<HTMLParagraphElement>) => {
        const item = event.currentTarget.innerText.toLowerCase();
        const newLocale = resolveLocale(item);
        console.log("language change: ", item, newLocale);
        i18n.changeLanguage(newLocale);
        setMenuOpen(false);
    };

    console.log(i18n.languages)

    return (
        <div className="rounded-full border border-gray-300 p-2 w-10 h-10 flex items-center justify-center">
            {menuOpen ? null : <p onClick={() => setMenuOpen(!menuOpen)}>{t("lang_emoji", { lng: i18n.language })}</p>}
            {menuOpen ?
                <div className="absolute bg-white border border-gray-300 rounded-md shadow-lg">
                    {[...new Set(i18n.languages)].map((lang: string) => (
                        <p key={lang} className="rounded-md" onClick={handleLanguageChange}>{t("lang_emoji", { lng: lang }) || defaultEmoji}</p>
                    ))}
                </div> : null
            }
        </div>
    )
};