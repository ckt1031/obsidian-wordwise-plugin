import base64url from 'base64url';

import type { PluginSettings } from './types';

const key = 'RSUH6NwtuGcUS252ssX2U4dCeCi48Yg2ekqnrKatZkmQRetZpxMUxqE'; // Replace with your own secret key

export const reverseString = (s: string) => {
	return [...s].reverse().join('');
};

export const xorCipher = (s: string, key: string) => {
	return (
		[...s]
			// eslint-disable-next-line unicorn/prefer-code-point
			.map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ key.charCodeAt(i % key.length)))
			.join('')
	);
};

export const deobfuscateConfig = (x: Record<string, string>) => {
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	if (!x?.z) {
		return null;
	}

	let deobfuscatedConfig = x.z;

	// Reverse the string
	deobfuscatedConfig = reverseString(deobfuscatedConfig);

	// Apply multiple rounds of base64 decoding
	for (let i = 0; i < 3; i++) {
		deobfuscatedConfig = base64url.decode(deobfuscatedConfig);
	}

	// Apply XOR cipher
	deobfuscatedConfig = xorCipher(deobfuscatedConfig, key);

	return JSON.parse(deobfuscatedConfig) as PluginSettings;
};

export const obfuscateConfig = (x: PluginSettings | null | undefined) => {
	if (x === null || x === undefined) {
		return x;
	}

	let obfuscatedConfig = JSON.stringify(x);

	// Apply XOR cipher
	obfuscatedConfig = xorCipher(obfuscatedConfig, key);

	// Apply multiple rounds of base64 encoding
	for (let i = 0; i < 3; i++) {
		obfuscatedConfig = base64url.encode(obfuscatedConfig);
	}

	// Reverse the string
	obfuscatedConfig = reverseString(obfuscatedConfig);

	return {
		_NOTICE:
			'DO NOT MODIFY THIS CONFIGURATION OR SHARE IT WITH ANYONE. IT SHOULD BE KEPT SECRET AND SECURE AT ALL TIMES. FAILURE TO COMPLY MAY DISRUPT THE FUNCTIONALITY OF THE SYSTEM.',
		z: obfuscatedConfig,
	};
};
