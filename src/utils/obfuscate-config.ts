import type { ObfuscatedPluginSettings, PluginSettings } from '@/types';

const SECRET_KEY = 'RSUH6NwtuGcUS252ssX2U4dCeCi48Yg2ekqnrKatZkmQRetZpxMUxqE';

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
	if (!obfuscatedSettings?.z) {
		return null;
	}

	let deobfuscatedConfig = reverseString(obfuscatedSettings.z);
	deobfuscatedConfig = xorCipher(deobfuscatedConfig, SECRET_KEY);

	return JSON.parse(deobfuscatedConfig) as PluginSettings;
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
		_NOTICE:
			'This configuration is sensitive and should not be modified or shared. Non-compliance may disrupt system functionality.',
		z: obfuscatedConfig,
	};
};

export { deobfuscateConfig, obfuscateConfig };
