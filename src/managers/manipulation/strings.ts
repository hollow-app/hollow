export function timeDifference(dateString: string): string {
        const inputDate = new Date(dateString);
        const now = new Date();

        const diffMs = now.getTime() - inputDate.getTime(); // Difference in milliseconds
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);
        const diffMonths = Math.floor(diffDays / 30);
        const diffYears = Math.floor(diffDays / 365);

        if (diffYears > 0)
                return `${diffYears} year${diffYears > 1 ? "s" : ""} ago`;
        if (diffMonths > 0)
                return `${diffMonths} month${diffMonths > 1 ? "s" : ""} ago`;
        if (diffDays > 0)
                return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
        if (diffHours > 0)
                return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
        return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;
}

export function formatDate(isoString: string) {
        const date = new Date(isoString);
        const year = date.getFullYear();
        const time = date.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
        });
        return `${year} at ${time}`;
}

export function weekOld(n_date: string) {
        const oneWeekInMs = 7 * 24 * 60 * 60 * 1000;
        return Date.now() - new Date(n_date).getTime() <= oneWeekInMs;
}
export function isExpired(n_date: string) {
        return new Date(n_date).getTime() < Date.now();
}
