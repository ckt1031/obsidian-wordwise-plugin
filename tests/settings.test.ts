import { describe, expect, it } from 'vitest';

import { APIProvider, type PluginSettings } from '../src/types';
import {
	deobfuscateConfig,
	obfuscateConfig,
} from '../src/utils/obfuscate-config';

const DEFAULT_SETTINGS: PluginSettings = {
	dataSchemeDate: new Date('2024-01-01'),

	apiProvider: APIProvider.OpenAI,
	openAiApiKey: 'sk-xxxxxx',
	temperature: 0.7,
	customAiModel: '',
	maxTokens: 1750,
	frequencyPenalty: 1,
	presencePenalty: -1,
	openAiBaseUrl: 'https://api.example.com',
	openAiModel: 'gpt-250-agi',
	debugMode: false,
	advancedSettings: false,
	customPrompts: [],
	anthropicApiKey: '123',
	anthropicBaseUrl: 'https://test.anthropic.com',
	anthropicModel: 'claude-9999',
	googleAIApiKey: '333',
	googleAIBaseUrl: 'https://generativeworld.googleapis.com',
	googleAIModel: 'gemini-10000',
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
