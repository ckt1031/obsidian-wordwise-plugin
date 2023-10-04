import { describe, expect, it } from 'vitest';

import type { PluginSettings } from '../src/types';
import { deobfuscateConfig, obfuscateConfig } from '../src/utils/obfuscate-config';

const DEFAULT_SETTINGS: PluginSettings = {
	// This API key is fake, random characters
	openAiApiKey: 'sk-iHj5FfRt8ZbD4XsLcNnMmKp2aUo6EeGgYyWq3v1',
	temperature: 0.7,
	maxTokens: 1750,
	frequencyPenalty: 1,
	presencePenalty: -1,
	openAiBaseUrl: 'https://api.example.com',
	openAiModel: 'gpt-4-32k',
	debugMode: false,
	advancedSettings: false,
	customPrompts: [],
};

describe('obfuscateConfig and deobfuscateConfig', () => {
	it('should obfuscate and deobfuscate the config correctly', () => {
		const obfuscatedConfig = obfuscateConfig(DEFAULT_SETTINGS);

		// Expect not to be equal to the default settings
		expect(obfuscatedConfig).not.toEqual(DEFAULT_SETTINGS);

		// Expect not to be undefined or null
		expect(obfuscatedConfig).not.toBeUndefined();
		expect(obfuscatedConfig).not.toBeNull();

		if (!obfuscatedConfig) {
			return;
		}

		const deobfuscatedConfig = deobfuscateConfig(obfuscatedConfig);

		expect(deobfuscatedConfig).toEqual(DEFAULT_SETTINGS);
	});

	it('should return null for empty or undefined input', () => {
		expect(obfuscateConfig(undefined)).toBeUndefined();
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-expect-error
		expect(deobfuscateConfig({})).toBeNull();
	});
});
