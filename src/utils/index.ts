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
