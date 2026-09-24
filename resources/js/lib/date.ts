// export function formatDate(dateString: string): string {
//     const date = new Date(dateString);

//     const formattedDate = new Intl.DateTimeFormat('en-US', {
//         month: 'short',
//         day: '2-digit',
//         year: 'numeric',
//     }).format(date);

//     // Check if the input string contains a time portion (e.g., "T14:30" or "14:30:00")
//     const hasTimeInInput = dateString.includes('T') || /\d{2}:\d{2}/.test(dateString);

//     // Check if the time is exactly 00:00:00
//     const isMidnight = date.getHours() === 0 && date.getMinutes() === 0 && date.getSeconds() === 0;

//     // Only show time if it exists in the input and it's not midnight
//     if (!hasTimeInInput || isMidnight) {
//         return formattedDate;
//     }

//     const formattedTime = new Intl.DateTimeFormat('en-US', {
//         hour: '2-digit',
//         minute: '2-digit',
//         hour12: true,
//     }).format(date);

//     return `${formattedDate} ${formattedTime}`;
// }
export function formatDate(dateString: string | null | undefined): string {
    if (!dateString || dateString.startsWith('0000-00-00')) {
        return '—'; // or '' — whatever your UI expects for empty dates
    }

    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
        console.warn('formatDate received an unparseable value:', dateString);
        return '—';
    }

    const formattedDate = new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
    }).format(date);

    const hasTimeInInput = dateString.includes('T') || /\d{2}:\d{2}/.test(dateString);
    const isMidnight = date.getHours() === 0 && date.getMinutes() === 0 && date.getSeconds() === 0;

    if (!hasTimeInInput || isMidnight) {
        return formattedDate;
    }

    const formattedTime = new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    }).format(date);

    return `${formattedDate} ${formattedTime}`;
}
