export function generateRandomString(length: number): string {
	return Array.from({ length }, () => Math.random().toString(36)[2]).join('');
}
