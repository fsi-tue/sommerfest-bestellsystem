import i18n, { InitOptions } from 'i18next';
import { initReactI18next } from 'react-i18next';
import { loadResources } from './i18n.resources';

export const resources: Record<string, any> = loadResources((lang: string, ns: string = "") => {

    return require(`@/config/locales/${lang}.yaml`).default ?? {};
});

export const i18nConfig: InitOptions = {
    lng: process.env.NODE_ENV === 'development' ? 'dev' : 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    defaultNS: 'translation',
    resources: resources,
    preload: Object.keys(resources),
};

export const i18nSettings = {
    languages: ['de', 'en', 'uwu'],
    fallbackLng: 'en',
    cookieName: 'i18next',
    headerName: 'x-i18next-current-language',
}

i18n
    .use(initReactI18next)
    .init(i18nConfig, (err, t) => {
        if (err) {
            console.error('i18n init error:', err);
        }
        i18n.loadLanguages(i18nConfig.preload || []).then(() => {
            console.log('i18n languages:', i18n.languages);
        });
    });


export default i18n;
