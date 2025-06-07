export type Locale = (typeof locales)[number];

export const locales = ['en', 'de', 'uwu'] as const;
export const defaultLocale: Locale = 'de';
