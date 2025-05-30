import i18n, { InitOptions } from 'i18next';
import { initReactI18next } from 'react-i18next';

function flattenKeys(obj: Record<string, any>, prefix = ''): Record<string, string> {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'object' && value !== null) {
      Object.assign(acc, flattenKeys(value, fullKey));
    } else {
      acc[fullKey] = fullKey;
    }

    return acc;
  }, {} as Record<string, string>);
}


let resources: Record<string, any> = {
  "de": require("@/config/locales/de.yaml")["default"] || {},
  "en": require("@/config/locales/en.yaml")["default"] || {},
  "uwu": require("@/config/locales/uwu.yaml")["default"] || {},
};

if (process.env.NODE_ENV === 'development') {
  const devTranslation: Record<string, string> = {};

  for (const lang of Object.keys(resources)) {
    const langTranslation = resources[lang]?.translation;
    if (!langTranslation) continue;

    const flattened = flattenKeys(langTranslation);
    Object.assign(devTranslation, flattened);
  }

  // Set special override
  devTranslation["lang_emoji"] = "🖥️";

  resources["dev"] = {
    translation: devTranslation
  };
}


const i18nConfig: InitOptions = {
  lng: process.env.NODE_ENV === 'development'?'dev':'en',
  fallbackLng: Object.keys(resources),
  interpolation: { escapeValue: false },
  resources: resources,
  preload: Object.keys(resources),
};

i18n
  .use(initReactI18next)
  .init(i18nConfig, (err, t) => {
    if (err) console.error('i18n init error:', err);
    i18n.loadLanguages(i18nConfig.preload || []).then(() => {
      // console.log('i18n languages:', i18n.languages);
    });
  });


export default i18n;
