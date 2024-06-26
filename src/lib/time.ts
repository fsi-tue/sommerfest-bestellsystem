export const formatDateTime = (date: Date, short = false) => {
    const options = {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: false // "AM/PM"
    }

    if (short) {
        return date.toLocaleDateString('en-US', options as any);
    }

    return date.toLocaleString('en-US', options as any);
};
