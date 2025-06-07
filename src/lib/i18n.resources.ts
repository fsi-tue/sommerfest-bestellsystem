export function flattenKeys(obj: Record<string, any>, prefix = ''): Record<string, string> {
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


export function loadResources(loadTranslation: (str: string) => any): Record<string, any> {
  let resources: Record<string, any> = {
    "de": loadTranslation("de"),
    "en": loadTranslation("en"),
    "uwu": loadTranslation("uwu"),
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
  return resources;
};