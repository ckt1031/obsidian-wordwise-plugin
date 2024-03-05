import { OpenAIModels, type PluginSettings } from './types';

/**
 * Reference: https://platform.openai.com/docs/models/overview
 * Updated: 2024-02-19
 */
export const AZURE_OPENAI_MODELS = [
	'gpt-4',
	'gpt-4-32k',
	'gpt-4-vision',
	'gpt-35-turbo',
	'gpt-35-turbo-16k',
];

/**
 * Reference: https://platform.openai.com/docs/models/overview
 * Updated: 2024-02-19
 */
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
	'gpt-4-vision-preview',
	'gpt-4-1106-preview',
	'gpt-4-0125-preview',
];

/**
 * Reference: https://docs.anthropic.com/claude/docs/models-overview
 * Updated: 2024-03-05
 */
export const ANTHROPIC_MODELS = [
	'claude-3-opus-20240229',
	'claude-3-sonnet-20240229',
	'claude-2.0',
	'claude-2.1',
	'claude-instant-1.1',
	'claude-instant-1.2',
];

/**
 * Reference: https://docs.cohere.com/reference/generate
 * Updated: 2024-02-05
 */
export const COHERE_MODELS = [
	'command',
	'command-nightly',
	'command-light',
	'command-light-nightly',
];

/**
 * Reference: https://docs.perplexity.ai/docs/model-cards
 * Updated: 2024-02-26
 */
export const PERPLEXITY_MODELS = [
	'sonar-small-chat',
	'sonar-medium-chat',
	'sonar-small-online',
	'sonar-medium-online',
	'llama-2-70b-chat',
	'codellama-34b-instruct',
	'codellama-70b-instruct',
	'mistral-7b-instruct',
	'mixtral-8x7b-instruct',
	'pplx-7b-chat',
	'pplx-7b-online',
	'pplx-70b-chat',
	'pplx-70b-online',
];

/**
 * Reference: https://openrouter.ai/docs#quick-start
 * Updated: 2024-02-21
 *
 * Since there is too many models, this will not hard code all models.
 * We will fetch the models from the API to local storage and use it from there.
 */
export const OPENROUTER_MODELS: OpenAIModels['data'] = [
	{
		id: 'openai/gpt-3.5-turbo',
		name: 'OpenAI: GPT-3.5 Turbo',
	},
	{
		id: 'openai/gpt-4',
		name: 'OpenAI: GPT-4',
	},
	{
		id: 'google/gemini-pro',
		name: 'Google: Gemini Pro (preview)',
	},
	{
		id: 'anthropic/claude-2',
		name: 'Anthropic: Claude v2',
	},
	{
		id: 'anthropic/claude-instant-1',
		name: 'Anthropic: Claude Instant v1',
	},
];

// Ref: https://ai.google.dev/models/gemini
// Updated on 2024-02-21
export const GOOGLE_AI_MODELS = ['gemini-pro', 'gemini-pro-vision'];

export enum APIProvider {
	/** https://openai.com */
	OpenAI = 'OpenAI',
	/** https://azure.microsoft.com/en-us/products/ai-services/openai-service */
	AzureOpenAI = 'Azure OpenAI',
	/** https://deepmind.google/technologies/gemini */
	GoogleGemini = 'Google Gemini',
	/** https://www.anthropic.com */
	Anthropic = 'Anthropic',
	/** https://cohere.com */
	Cohere = 'Cohere',
	/** https://openrouter.ai */
	OpenRouter = 'OpenRouter',
	/** https://docs.perplexity.ai */
	PerplexityAI = 'Perplexity',
	/** OpenAI Compatible API, such as OneAPI and FastGPT */
	Custom = 'Custom (OpenAI Compatible)',
}

export enum CommandNames {
	ImproveWriting = 'Improve Writing',
	FixGrammar = 'Fix Grammar',
	SimplifyText = 'Simplify Text',
	MakeShorter = 'Make Shorter',
	MakeLonger = 'Make Longer',
	Paraphrase = 'Paraphrase',
	IntelligentBold = 'Intelligent Bold',

	// Extra Commands
	CustomInstructions = 'Custom Instructions',
}

export enum CommandActions {
	/**
	 * Directly replace the selected text with the generated text.
	 */
	DirectReplacement = 0,
	/**
	 * This will not be using native prompts, but instead will be using custom prompts by a modal for custom instructions.
	 */
	CustomInstructions = 1,
}

export const DEFAULT_HOST = {
	[APIProvider.OpenAI]: 'https://api.openai.com',
	[APIProvider.AzureOpenAI]: '',
	[APIProvider.GoogleGemini]: 'https://generativelanguage.googleapis.com',
	[APIProvider.Anthropic]: 'https://api.anthropic.com',
	[APIProvider.Cohere]: 'https://api.cohere.ai',
	[APIProvider.OpenRouter]: 'https://openrouter.ai',
	[APIProvider.PerplexityAI]: 'https://api.perplexity.ai',
	[APIProvider.Custom]: '',
};

export const DEFAULT_SETTINGS: PluginSettings = {
	dataSchemeDate: new Date('2024-02-22').toISOString(),

	aiProvider: APIProvider.OpenAI,
	aiProviderConfig: {
		[APIProvider.OpenAI]: {
			apiKey: '',
			baseUrl: DEFAULT_HOST[APIProvider.OpenAI],
			model: 'gpt-3.5-turbo',
		},
		[APIProvider.AzureOpenAI]: {
			apiKey: '',
			baseUrl: '',
			model: 'gpt-35-turbo',
			apiVersion: '2023-05-15',
		},
		[APIProvider.GoogleGemini]: {
			apiKey: '',
			baseUrl: DEFAULT_HOST[APIProvider.GoogleGemini],
			model: 'gemini-pro',
		},
		[APIProvider.Anthropic]: {
			apiKey: '',
			baseUrl: DEFAULT_HOST[APIProvider.Anthropic],
			model: 'claude-2.1',
		},
		[APIProvider.Cohere]: {
			apiKey: '',
			baseUrl: DEFAULT_HOST[APIProvider.Cohere],
			model: 'command',
		},
		[APIProvider.OpenRouter]: {
			apiKey: '',
			baseUrl: DEFAULT_HOST[APIProvider.OpenRouter],
			model: 'openai/gpt-3.5-turbo',
		},
		[APIProvider.PerplexityAI]: {
			apiKey: '',
			baseUrl: DEFAULT_HOST[APIProvider.PerplexityAI],
			model: '',
		},
		[APIProvider.Custom]: {
			apiKey: '',
			baseUrl: '',
			model: '',
		},
	},

	advancedSettings: false,
	customAiModel: '',
	maxTokens: 2000,
	temperature: 0.5,
	presencePenalty: 0,
	frequencyPenalty: 0,

	enableGenerationLogging: false,

	debugMode: false,

	customPrompts: [],
};

export const settingTabProviderConfiguations = {
	[APIProvider.OpenAI]: {
		defaultHost: DEFAULT_HOST[APIProvider.OpenAI],
		docs: 'https://platform.openai.com/docs/introduction',
		defaultModel: 'gpt-3.5-turbo',
		models: OPENAI_MODELS,
	},
	[APIProvider.AzureOpenAI]: {
		defaultHost: '',
		docs: 'https://learn.microsoft.com/en-us/azure/ai-services/openai/reference',
		defaultModel: 'gpt-35-turbo',
		models: AZURE_OPENAI_MODELS,
	},
	[APIProvider.Anthropic]: {
		defaultHost: DEFAULT_HOST[APIProvider.Anthropic],
		docs: 'https://docs.anthropic.com/claude/reference/getting-started-with-the-api',
		defaultModel: 'claude-2.1',
		models: ANTHROPIC_MODELS,
	},
	[APIProvider.GoogleGemini]: {
		defaultHost: DEFAULT_HOST[APIProvider.GoogleGemini],
		docs: 'https://ai.google.dev/models/gemini',
		defaultModel: 'gemini-pro',
		models: GOOGLE_AI_MODELS,
	},
	[APIProvider.Cohere]: {
		defaultHost: DEFAULT_HOST[APIProvider.Cohere],
		docs: 'https://docs.cohere.com/reference/versioning',
		defaultModel: 'command',
		models: COHERE_MODELS,
	},
	[APIProvider.OpenRouter]: {
		defaultHost: DEFAULT_HOST[APIProvider.OpenRouter],
		docs: 'https://openrouter.ai/docs',
		defaultModel: OPENROUTER_MODELS[0],
		models: OPENROUTER_MODELS,
	},
	[APIProvider.PerplexityAI]: {
		defaultHost: DEFAULT_HOST[APIProvider.PerplexityAI],
		docs: 'https://docs.perplexity.ai',
		defaultModel: '',
		models: PERPLEXITY_MODELS,
	},
	[APIProvider.Custom]: {
		defaultHost: '',
		docs: '',
		defaultModel: '',
		models: [],
	},
};
