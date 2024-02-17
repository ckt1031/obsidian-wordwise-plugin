export function getAPIHost(url: string, defaultHost: string): string {
	return url.length > 0 ? url : defaultHost;
}
