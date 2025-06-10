import { getUserLocale } from '@/services/locale';
import { getRequestConfig, RequestConfig } from 'next-intl/server';

export async function loadMessages(locale: string): Promise<RequestConfig> {

    // Import the raw YAML content as a string
    const yamlModule = await import(`@/i18n/locales/${locale}.yaml?raw`);
    return yamlModule.default.translation
}

export default getRequestConfig(async () => {
    const locale = await getUserLocale();
    const messages = await loadMessages(locale);

    return {
        locale,
        messages: messages
    };
});
