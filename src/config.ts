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

// Ref: https://docs.cohere.com/reference/generate
// Updated on 2024-02-05
export const COHERE_MODELS = [
	'command',
	'command-nightly',
	'command-light',
	'command-light-nightly',
];

// This key can be exposed here as the aim is only to prevent direct exposure of data through sharing.
export const QR_CODE_ENCRYPT_KEY = 'DsH24E4xr8AfeZz24n6BCdew6f63';

// Ref: https://ai.google.dev/models/gemini
// Updated on 2024-01-26
export const GOOGLE_AI_MODELS = ['gemini-pro'];

export const DEFAULT_OPENAI_API_HOST = 'https://api.openai.com';
export const DEFAULT_ANTHROPIC_API_HOST = 'https://api.anthropic.com';
export const DEFAULT_GOOGLE_AI_API_HOST =
	'https://generativelanguage.googleapis.com';
export const DEFAULT_COHERE_AI_API_HOST = 'https://api.cohere.ai';

export const DEFAULT_SETTINGS: PluginSettings = {
	dataSchemeDate: new Date('2024-02-03').toISOString(),

	aiProvider: APIProvider.OpenAI,
	aiProviderConfig: {
		[APIProvider.OpenAI]: {
			apiKey: '',
			baseUrl: DEFAULT_OPENAI_API_HOST,
			model: 'gpt-3.5-turbo',
		},
		[APIProvider.GoogleGemini]: {
			apiKey: '',
			baseUrl: DEFAULT_GOOGLE_AI_API_HOST,
			model: 'gemini-pro',
		},
		[APIProvider.Anthropic]: {
			apiKey: '',
			baseUrl: DEFAULT_ANTHROPIC_API_HOST,
			model: 'claude-2.1',
		},
		[APIProvider.Cohere]: {
			apiKey: '',
			baseUrl: DEFAULT_COHERE_AI_API_HOST,
			model: 'command',
		},
	},

	customAiModel: '',
	maxTokens: 2000,
	temperature: 0.5,
	presencePenalty: 0,
	frequencyPenalty: 0,
	advancedSettings: false,
	debugMode: false,
	customPrompts: [],
};

export const settingTabProviderConfiguations = {
	[APIProvider.OpenAI]: {
		defaultHost: DEFAULT_OPENAI_API_HOST,
		docs: 'https://platform.openai.com/docs/introduction',
		defaultModel: 'gpt-3.5-turbo',
		models: OPENAI_MODELS,
	},
	[APIProvider.Anthropic]: {
		defaultHost: DEFAULT_ANTHROPIC_API_HOST,
		docs: 'https://docs.anthropic.com/claude/reference/getting-started-with-the-api',
		defaultModel: 'claude-2.1',
		models: ANTHROPIC_MODELS,
	},
	[APIProvider.GoogleGemini]: {
		defaultHost: DEFAULT_GOOGLE_AI_API_HOST,
		docs: 'https://ai.google.dev/models/gemini',
		defaultModel: 'gemini-pro',
		models: GOOGLE_AI_MODELS,
	},
	[APIProvider.Cohere]: {
		defaultHost: DEFAULT_COHERE_AI_API_HOST,
		docs: 'https://docs.cohere.com/reference/versioning',
		defaultModel: 'command',
		models: COHERE_MODELS,
	},
};
