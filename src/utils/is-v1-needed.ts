export default function isV1Needed(url: string) {
	// Use URL to parse the host from the URL
	const host = new URL(url).host;

	const v1NoNeededHosts = ['gateway.ai.cloudflare.com'];

	// Check if the host is in the list of hosts that don't need a v1
	return !v1NoNeededHosts.includes(host);
}
