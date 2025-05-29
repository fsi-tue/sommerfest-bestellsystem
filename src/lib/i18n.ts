import i18n, { InitOptions } from 'i18next';
import { initReactI18next } from 'react-i18next';

let resources: Record<string, any> = {
  "de": require("@/config/locales/de.yaml")["default"] || {},
  "en": require("@/config/locales/en.yaml")["default"] || {},
  "uwu": require("@/config/locales/uwu.yaml")["default"] || {},
};

if (process.env.NODE_ENV === 'development') {
  resources["dev"] = {
    "translation": {
    }
  };
  const all_keys: string[] = [
    ... new Set(Object.keys(resources).flatMap(lang => Object.keys(resources[lang]["translation"])))
  ];
  for(let idx in all_keys) {
    const defined_key = all_keys[idx];
    resources["dev"]["translation"][defined_key] = defined_key;
  }
  resources["dev"]["translation"]["lang_emoji"] = "🖥️";
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
      console.log('i18n languages:', i18n.languages);
    });
  });


export default i18n;
