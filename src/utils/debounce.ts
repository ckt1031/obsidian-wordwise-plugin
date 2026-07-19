export function debounce<Args extends unknown[]>(
	callback: (...args: Args) => void,
	delay: number,
): (...args: Args) => void {
	let timeoutId: ReturnType<typeof setTimeout> | undefined;

	return (...args) => {
		if (timeoutId) clearTimeout(timeoutId);

		timeoutId = setTimeout(() => callback(...args), delay);
	};
}
