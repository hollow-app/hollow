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
	if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
	if (diffHours > 0)
		return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
	return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;
}
export function timeDifferenceMin(dateString: string) {
	const date = new Date(dateString);
	const now = new Date();
	const diff = now.getTime() - date.getTime();

	const seconds = Math.floor(diff / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);
	const weeks = Math.floor(days / 7);
	const months = Math.floor(days / 30);
	const years = Math.floor(days / 365);

	if (years > 0) return `${years}y`;
	if (months > 0) return `${months}mo`;
	if (weeks > 0) return `${weeks}w`;
	if (days > 0) return `${days}d`;
	if (hours > 0) return `${hours}h`;
	if (minutes > 0) return `${minutes}m`;
	return `${seconds}s`;
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
export function estimateReadingTimeMs(
	lines: string[],
	wordsPerMinute: number = 350,
): number {
	const totalWords = lines
		.join(" ")
		.trim()
		.split(/\s+/)
		.filter(Boolean).length;

	const minutes = totalWords / wordsPerMinute;
	return Math.round(minutes * 60_000);
}
export function EventEmitterSource(source: string, returns: any[]): any {
	for (const obj of returns) {
		if (typeof obj === "object" && obj) {
			if (obj["source"] === source) {
				return obj;
			}
		}
	}
}
