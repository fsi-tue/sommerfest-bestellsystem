export const getFromLocalStorage = (key, defaultValue) => {
	let value = defaultValue ?? null;
	if (typeof window !== "undefined") {
		value = localStorage.getItem(key)
	}
	return value;
}

export const addToLocalStorage = (key, value) => {
	if (typeof window !== "undefined") {
		localStorage.setItem(key, value)
	}
}

export const removeFromLocalStorage = (key) => {
	if (typeof window !== "undefined") {
		localStorage.removeItem(key)
	}
}
