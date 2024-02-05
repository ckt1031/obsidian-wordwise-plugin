import { describe, expect, it } from 'vitest';

import { APIProvider, type PluginSettings } from '@/types';
import { deobfuscateConfig, obfuscateConfig } from '@/utils/obfuscate-config';

const DEFAULT_SETTINGS: PluginSettings = {
	dataSchemeDate: new Date('2024-01-01').toISOString(),

	aiProvider: APIProvider.OpenAI,

	aiProviderConfig: {
		[APIProvider.OpenAI]: {
			apiKey: 'sk-xxx',
			baseUrl: 'https://api.example.com',
			model: 'openai',
		},
		[APIProvider.GoogleGemini]: {
			apiKey: 'g-xxxx',
			baseUrl: 'https://googleapis.com',
			model: 'gemini',
		},
		[APIProvider.Anthropic]: {
			apiKey: 'an-xxx',
			baseUrl: 'https://test.example.com',
			model: 'claude',
		},
	},

	temperature: 0.7,
	customAiModel: '',
	maxTokens: 1750,
	frequencyPenalty: 1,
	presencePenalty: -1,
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
