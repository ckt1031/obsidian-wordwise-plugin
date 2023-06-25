export function base64UrlEncode(input: string): string {
	const base64 = Buffer.from(input).toString('base64');
	return base64.replace('+', '-').replace('/', '_').replace(/=+$/, '');
}

export function base64UrlDecode(input: string): string {
	input = input.replace('-', '+').replace('_', '/');
	while (input.length % 4) {
		input += '=';
	}
	return Buffer.from(input, 'base64').toString();
}
