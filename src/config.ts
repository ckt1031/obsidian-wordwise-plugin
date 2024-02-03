import { APIProvider, type PluginSettings } from './types';

// Ref: https://platform.openai.com/docs/models/overview
// Updated on 2024-02-02
export const OPENAI_MODELS = [
	'gpt-3.5-turbo',
	'gpt-3.5-turbo-1106',
	'gpt-3.5-turbo-0125',
	'gpt-3.5-turbo-16k',
	'gpt-4',
	'gpt-4-0613',
	'gpt-4-32k',
	'gpt-4-32k-0613',
	'gpt-4-turbo-preview',
	'gpt-4-1106-preview',
	'gpt-4-0125-preview',
];

// Ref: https://docs.anthropic.com/claude/reference/selecting-a-model
// Updated on 2024-02-02
export const ANTHROPIC_MODELS = [
	'claude-2.0',
	'claude-2.1',
	'claude-instant-1.1',
	'claude-instant-1.2',
];

// Ref: https://ai.google.dev/models/gemini
// Updated on 2024-01-26
export const GOOGLE_AI_MODELS = ['gemini-pro'];

export const DEFAULT_OPENAI_API_HOST = 'https://api.openai.com';
export const DEFAULT_ANTHROPIC_API_HOST = 'https://api.anthropic.com';
export const DEFAULT_GOOGLE_AI_API_HOST =
	'https://generativelanguage.googleapis.com';

export const DEFAULT_SETTINGS: PluginSettings = {
	dataSchemeDate: new Date('2024-02-03').toISOString(),

	apiProvider: APIProvider.OpenAI,

	openAiApiKey: '',
	openAiBaseUrl: DEFAULT_OPENAI_API_HOST,
	openAiModel: 'gpt-3.5-turbo',

	anthropicApiKey: '',
	anthropicBaseUrl: DEFAULT_ANTHROPIC_API_HOST,
	anthropicModel: 'claude-2.1',

	googleAIApiKey: '',
	googleAIBaseUrl: DEFAULT_GOOGLE_AI_API_HOST,
	googleAIModel: 'gemini-pro',

	customAiModel: '',
	maxTokens: 2000,
	temperature: 0.5,
	presencePenalty: 0,
	frequencyPenalty: 0,
	advancedSettings: false,
	debugMode: false,
	customPrompts: [],
};
