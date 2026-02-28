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
			// if (event.data.requestId !== requestId) return;
			window.removeEventListener("message", handler);
			resolve(event.data.payload);
		}
		window.addEventListener("message", handler);
		iframe.contentWindow.postMessage(
			{
				type,
				// requestId,
				payload: message,
			},
			"*",
		);
	});
}
