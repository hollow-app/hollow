export function debounce<F extends (...args: any[]) => any>(
	fn: F,
	delay: number,
): (...args: Parameters<F>) => void {
	let timer: ReturnType<typeof setTimeout> | null = null;

	return (...args: Parameters<F>) => {
		if (timer) clearTimeout(timer);
		timer = setTimeout(() => {
			fn(...args);
		}, delay);
	};
}
export async function sendIframeRequest(
	iframe: HTMLIFrameElement,
	type: string,
	message: any,
) {
	return await new Promise((resolve, reject) => {
		// const requestId = crypto.randomUUID();
		function handler(event: any) {
			if (event.origin !== "null") return;
			if (!event.data) return;
			if (event.data.type !== type) return;
			// if (event.data.requestId !== requestId) return;
			window.removeEventListener("message", handler);
			resolve(event.data.payload);
		}
		window.addEventListener("message", handler);
		iframe.contentWindow.postMessage(
			{
				type,
				// requestId,
				__hollow: true,
				payload: message,
			},
			"*",
		);
	});
}
type CacheEntry<T> = {
	data: T;
	timestamp: number;
};

export async function fetchWithBackup<T>(
	url: string,
	options?: RequestInit,
	intervalMs: number = 5000,
): Promise<T> {
	const now = Date.now();
	const cachedStr = localStorage.getItem(url);
	let cached: CacheEntry<T> | null = null;
	if (cachedStr) {
		try {
			cached = JSON.parse(cachedStr) as CacheEntry<T>;
		} catch (err) {
			console.warn("Failed to parse cached data", err);
			localStorage.removeItem(url);
		}
	}
	if (cached && now - cached.timestamp < intervalMs) {
		return cached.data;
	}
	try {
		const response = await fetch(url, options);
		if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
		const data: T = await response.json();
		const entry: CacheEntry<T> = { data, timestamp: now };
		localStorage.setItem(url, JSON.stringify(entry));
		return data;
	} catch (err) {
		if (cached) {
			console.warn(`Fetch failed, returning cached data for ${url}`, err);
			return cached.data;
		}
		throw err;
	}
}
