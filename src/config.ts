import type { OpenAIModels, PluginSettings } from './types';

/**
 * Reference: https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/models#gpt-4o-and-gpt-4-turbo
 * Updated: 2024-10-03
 */
export const AZURE_OPENAI_MODELS = ['gpt-4o', 'gpt-4o-mini'];

/**
 * Reference: https://platform.openai.com/docs/models
 * Updated: 2024-10-03
 */
export const OPENAI_MODELS = [
	'gpt-4o',
	'gpt-4o-2024-08-06',

	'gpt-4o-mini',
	'gpt-4o-mini-2024-07-18',
];

/**
 * Reference: https://docs.anthropic.com/en/docs/about-claude/models
 * Updated: 2025-02-08
 */
export const ANTHROPIC_MODELS = [
	'claude-3-5-sonnet-latest',
	'claude-3-5-haiku-latest',
	'claude-3-opus-latest',
];

/**
 * Reference: https://docs.cohere.com/docs/models
 * Updated: 2024-10-03
 * Model fetching is available from the API.
 */
export const COHERE_MODELS = ['command-r-plus', 'command-r', 'command'];

/**
 * Reference: https://docs.perplexity.ai/guides/model-cards
 * Updated: 2025-02-08
 */
export const PERPLEXITY_MODELS = [
	'sonar',
	'sonar-reasoning-pro',
	'sonar-reasoning',
	'sonar-reasoning-pro',
];

/**
 * Reference: https://openrouter.ai/docs#quick-start
 * Updated: 2024-04-05
 *
 * Since there is too many models, this will not hard code all models.
 * We will fetch the models from the API to local storage and use it from there.
 */
export const OPENROUTER_MODELS: OpenAIModels['data'] = [
	{
		id: 'openai/gpt-4o-mini',
		name: 'OpenAI: GPT-4o Mini',
	},
	{
		id: 'google/gemini-2.0-flash-001',
		name: 'Google: Gemini 2.0 Flash',
	},
];

export enum CustomBehavior {
	InsertFirst = 'Insert First',
	InsertLast = 'Insert Last',
	Replace = 'Replace',
}

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

	Ollama = 'Ollama',
	/** OpenAI Compatible API, such as OneAPI and FastGPT */
	Custom = 'Custom (OpenAI Compatible)',
}

export enum CommandNames {
	FindSynonym = 'Find Synonym',
	FixGrammar = 'Fix Grammar',
	ImproveWriting = 'Improve Writing',
	Bold = 'Bold Important Ideas',
	MakeLonger = 'Make Longer',
	MakeShorter = 'Make Shorter',
	Paraphrase = 'Paraphrase',
	SimplifyText = 'Simplify Text',

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
	[APIProvider.Ollama]: 'http://localhost:11434',
	[APIProvider.Custom]: '',
};

export const DEFAULT_SETTINGS: PluginSettings = {
	dataSchemeDate: new Date('2024-04-15').toISOString(),

	aiProvider: APIProvider.OpenAI,
	aiProviderConfig: {
		[APIProvider.OpenAI]: {
			apiKey: '',
			baseUrl: DEFAULT_HOST[APIProvider.OpenAI],
			model: 'gpt-4o-mini',
		},
		[APIProvider.AzureOpenAI]: {
			apiKey: '',
			baseUrl: '',
			model: 'gpt-4o-mini',
			apiVersion: '',
		},
		[APIProvider.GoogleGemini]: {
			apiKey: '',
			baseUrl: DEFAULT_HOST[APIProvider.GoogleGemini],
			model: 'gemini-2.0-flash',
		},
		[APIProvider.Anthropic]: {
			apiKey: '',
			baseUrl: DEFAULT_HOST[APIProvider.Anthropic],
			model: 'claude-3-5-sonnet-20240620',
		},
		[APIProvider.Cohere]: {
			apiKey: '',
			baseUrl: DEFAULT_HOST[APIProvider.Cohere],
			model: 'command-r-plus',
		},
		[APIProvider.OpenRouter]: {
			apiKey: '',
			baseUrl: DEFAULT_HOST[APIProvider.OpenRouter],
			model: 'openai/gpt-4o-mini',
		},
		[APIProvider.Ollama]: {
			apiKey: '',
			baseUrl: DEFAULT_HOST[APIProvider.Ollama],
			model: '',
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
	enableGenerationLogging: false,
	debugMode: false,
	customPrompts: [],
	disableNativeCommands: false,
	customPromptsFromFolder: {
		enabled: false,
		path: 'Wordwise',
	},

	// Custom Behavior
	customBehavior: CustomBehavior.Replace,
};

export const settingTabProviderConfigurations = {
	[APIProvider.OpenAI]: {
		defaultHost: DEFAULT_HOST[APIProvider.OpenAI],
		docs: 'https://platform.openai.com/docs/introduction',
		defaultModel: 'gpt-4o-mini',
		models: OPENAI_MODELS,
	},
	[APIProvider.AzureOpenAI]: {
		defaultHost: '',
		docs: 'https://learn.microsoft.com/en-us/azure/ai-services/openai/reference',
		defaultModel: 'gpt-4o-mini',
		models: AZURE_OPENAI_MODELS,
	},
	[APIProvider.Anthropic]: {
		defaultHost: DEFAULT_HOST[APIProvider.Anthropic],
		docs: 'https://docs.anthropic.com/claude/reference/getting-started-with-the-api',
		defaultModel: 'claude-3-5-sonnet-20240620',
		models: ANTHROPIC_MODELS,
	},
	[APIProvider.GoogleGemini]: {
		defaultHost: DEFAULT_HOST[APIProvider.GoogleGemini],
		docs: 'https://ai.google.dev/models/gemini',
		defaultModel: 'gemini-2.0-flash',
		models: [],
	},
	[APIProvider.Cohere]: {
		defaultHost: DEFAULT_HOST[APIProvider.Cohere],
		docs: 'https://docs.cohere.com/reference/versioning',
		defaultModel: 'command-r-plus',
		models: COHERE_MODELS,
	},
	[APIProvider.OpenRouter]: {
		defaultHost: DEFAULT_HOST[APIProvider.OpenRouter],
		docs: 'https://openrouter.ai/docs',
		defaultModel: OPENROUTER_MODELS[0],
		models: OPENROUTER_MODELS,
	},
	[APIProvider.Ollama]: {
		defaultHost: DEFAULT_HOST[APIProvider.Ollama],
		docs: 'https://github.com/ollama/ollama/blob/main/docs/api.md#generate-a-chat-completion',
		defaultModel: '',
		models: [],
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
