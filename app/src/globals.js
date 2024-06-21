function getEnvVariable(key, fallback) {
	if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key] !== undefined) {
		return import.meta.env[key];
	}
	if (typeof process !== 'undefined' && process.env && process.env[key] !== undefined) {
		return process.env[key];
	}
	return fallback;
}

export const API_ENDPOINT  = getEnvVariable("VITE_API_ENDPOINT", "http://localhost:8000");
export const THIS_ENDPOINT = getEnvVariable("VITE_THIS_ENDPOINT", "http://localhost:3000");
