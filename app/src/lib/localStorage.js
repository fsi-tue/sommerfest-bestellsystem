export const getFromLocalStorage = (key, defaultValue) => {
	let value = defaultValue;
	if (typeof window !== "undefined") {
		value = localStorage.getItem(key) || ""
	}
	return value;
}
