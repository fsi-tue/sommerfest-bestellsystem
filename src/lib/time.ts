export const formatDateTime = (date: Date) => {
    const options = {
        weekday: 'long', // "Monday"
        year: 'numeric', // "2024"
        month: 'long', // "June"
        day: 'numeric', // "22"
        hour: 'numeric', // "10"
        minute: 'numeric', // "30"
        second: 'numeric', // "15"
        hour12: false // "AM/PM"
    };

    return date.toLocaleDateString('en-US', options as any);
};
