export function getAPIHost(url: string, defaultHost: string): string {
	const urlPrefix = url.startsWith('http') ? '' : 'http://';
	const host = url.length > 0 ? url : defaultHost;

	return `${urlPrefix}${host}`;
}

if (import.meta.vitest) {
	const { it, expect } = import.meta.vitest;
	it('getAPIHost', () => {
		expect(getAPIHost('https://example.com', 'localhost')).toBe(
			'https://example.com',
		);
		expect(getAPIHost('example.com', 'localhost')).toBe('http://example.com');
		expect(getAPIHost('', 'localhost')).toBe('http://localhost');
	});
}
