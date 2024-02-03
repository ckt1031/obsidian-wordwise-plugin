export function getAPIHost(url: string, defaultHost: string): string {
	const urlPrefix = url.startsWith('http') ? '' : 'http://';
	const host = url.length > 0 ? url : defaultHost;

	return `${urlPrefix}${host}`;
}
