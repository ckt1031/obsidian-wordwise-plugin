import { DEFAULT_SETTINGS } from '@/config';
import type { ObfuscatedPluginSettings, PluginSettings } from '@/types';

/**
 * Security Reminder
 *
 * This is to obfuscate the plugin settings to avoid known software scanning the API keys.
 * It is not a guarantee of security, you should always be careful with software that you install.
 */

const SECRET_KEY = process.env.SETTINGS_OBFUSCATE_KEY || 'secret';

const reverseString = (input: string): string => [...input].reverse().join('');

const xorCipher = (input: string, key: string): string =>
	[...input]
		.map((char, index) =>
			String.fromCharCode(
				char.charCodeAt(0) ^ key.charCodeAt(index % key.length),
			),
		)
		.join('');

const deobfuscateConfig = (
	obfuscatedSettings: ObfuscatedPluginSettings | undefined,
): PluginSettings | null => {
	try {
		if (!obfuscatedSettings?.z) {
			return null;
		}

		let deobfuscatedConfig = reverseString(obfuscatedSettings.z);
		deobfuscatedConfig = xorCipher(deobfuscatedConfig, SECRET_KEY);

		return JSON.parse(deobfuscatedConfig) as PluginSettings;
	} catch (e) {
		console.error('Error while deobfuscating the plugin settings:', e);
		return null;
	}
};

const obfuscateConfig = (
	settings: PluginSettings | null | undefined,
): ObfuscatedPluginSettings | undefined => {
	if (!settings) {
		return undefined;
	}

	let obfuscatedConfig = JSON.stringify(settings);
	obfuscatedConfig = xorCipher(obfuscatedConfig, SECRET_KEY);
	obfuscatedConfig = reverseString(obfuscatedConfig);

	return {
		_NOTICE: 'Obfuscated configuration, do not tamper with it.',
		z: obfuscatedConfig,
	};
};

export { deobfuscateConfig, obfuscateConfig };

if (import.meta.vitest) {
	const { describe, it, expect } = import.meta.vitest;
	describe('obfuscateConfig and deobfuscateConfig', () => {
		it('should obfuscate and deobfuscate the config correctly', () => {
			const obfuscatedConfig = obfuscateConfig(DEFAULT_SETTINGS);

			// Expect not to be equal to the default settings
			expect(obfuscatedConfig).not.toEqual(DEFAULT_SETTINGS);

			// Expect not to be undefined or null
			expect(obfuscatedConfig).not.toBeUndefined();
			expect(obfuscatedConfig).not.toBeNull();

			if (!obfuscatedConfig) return;

			const deobfuscatedConfig = deobfuscateConfig(obfuscatedConfig);

			expect(deobfuscatedConfig).toEqual(DEFAULT_SETTINGS);
		});

		it('should return null for empty or undefined input', () => {
			expect(obfuscateConfig(undefined)).toBeUndefined();
			// @ts-expect-error
			expect(deobfuscateConfig({})).toBeNull();
		});
	});
}
