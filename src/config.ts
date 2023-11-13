import type { PluginSettings } from './types';

export const OPENAI_MODELS = [
	'gpt-3.5-turbo',
	'gpt-3.5-turbo-0301',
	'gpt-3.5-turbo-0613',
	'gpt-3.5-turbo-1106',
	'gpt-3.5-turbo-16k',
	'gpt-3.5-turbo-16k-0613',
	'gpt-4',
	'gpt-4-0314',
	'gpt-4-32k',
	'gpt-4-0613',
	'gpt-4-32k-0613',
	'gpt-4-32k-0314',
	'gpt-4-1106-preview',
	'gpt-4-vision-preview',
];

export const DEFAULT_API_HOST = 'https://api.openai.com';

export const DEFAULT_SETTINGS: PluginSettings = {
	openAiApiKey: '',
	openAiBaseUrl: 'https://api.openai.com',
	openAiModel: 'gpt-3.5-turbo',
	customAiModel: '',
	maxTokens: 2000,
	temperature: 0.5,
	presencePenalty: 0,
	frequencyPenalty: 0,
	advancedSettings: false,
	debugMode: false,
	customPrompts: [],
};
