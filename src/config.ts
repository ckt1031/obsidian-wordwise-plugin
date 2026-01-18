import type { PluginSettings } from './types';

export enum CustomBehavior {
	InsertFirst = 'Insert First',
	InsertLast = 'Insert Last',
	Replace = 'Replace',
}

export enum APIProvider {
	/** https://openai.com */
	OpenAI = 'OpenAI',
	// TODO: Add Azure OpenAI support with @ai-sdk/azure
	/** https://azure.microsoft.com/en-us/products/ai-services/openai-service */
	// AzureOpenAI = 'Azure OpenAI',
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
	/** https://ollama.com */
	Ollama = 'Ollama',
	/** https://lmstudio.ai/docs/app/api/endpoints/openai */
	LMStudio = 'LM Studio',
	/** https://api-docs.deepseek.com */
	DeepSeek = 'DeepSeek',
	/** https://docs.mistral.ai/getting-started/quickstart */
	Mistral = 'Mistral',
	/** https://docs.x.ai/docs/api-reference#chat-completions */
	XAI = 'X.AI',
	/** https://docs.github.com/en/github-models/prototyping-with-ai-models */
	GitHub = 'GitHub',

	/** OpenAI Compatible API, such as OneAPI and FastGPT */
	Custom = 'Custom (OpenAI Compatible)',
}

export enum InternalPromptNames {
	FindSynonym = 'Find Synonym',
	FixGrammar = 'Fix Grammar',
	ImproveWriting = 'Improve Writing',
	Bold = 'Bold Important Ideas',
	MakeLonger = 'Make Longer',
	MakeShorter = 'Make Shorter',
	Paraphrase = 'Paraphrase',
	SimplifyText = 'Simplify Text',
	CustomInstructions = 'Custom Instructions',
}

export enum PrePromptActions {
	/**
	 * Directly replace the selected text with the generated text.
	 */
	DirectReplacement = 0,
	/**
	 * This will not be using native prompts, but instead will be using custom prompts by a modal for custom instructions.
	 */
	CustomInstructions = 1,
}

export const PROVIDER_DEFAULTS: Record<
	APIProvider,
	{ host: string; models: string }
> = {
	[APIProvider.OpenAI]: {
		host: 'https://api.openai.com',
		models: '/v1/models',
	},
	[APIProvider.GoogleGemini]: {
		host: 'https://generativelanguage.googleapis.com',
		models: '/v1beta/models',
	},
	[APIProvider.Anthropic]: {
		host: 'https://api.anthropic.com',
		models: '/v1/models',
	},
	[APIProvider.Cohere]: {
		host: 'https://api.cohere.ai',
		models: '/compatibility/v1/models',
	},
	[APIProvider.OpenRouter]: {
		host: 'https://openrouter.ai',
		models: '/api/v1/models',
	},
	[APIProvider.PerplexityAI]: {
		host: 'https://api.perplexity.ai',
		models: '/models',
	},
	[APIProvider.Ollama]: {
		host: 'http://localhost:11434',
		models: '/v1/models',
	},
	[APIProvider.LMStudio]: {
		host: 'http://localhost:1234',
		models: '/v1/models',
	},
	[APIProvider.DeepSeek]: {
		host: 'https://api.deepseek.com',
		models: '/v1/models',
	},
	[APIProvider.Mistral]: {
		host: 'https://api.mistral.ai',
		models: '/v1/models',
	},
	[APIProvider.XAI]: {
		host: 'https://api.x.ai',
		models: '/v1/models',
	},
	[APIProvider.GitHub]: {
		host: 'https://models.inference.ai.azure.com',
		models: '/models',
	},
	[APIProvider.Custom]: {
		host: '',
		models: '/models',
	},
};

export const DEFAULT_SETTINGS: PluginSettings = {
	aiProvider: APIProvider.OpenAI,
	aiProviderConfig: Object.fromEntries(
		Object.entries(APIProvider).map(([_, provider]) => [
			provider,
			{
				model: '',
				apiKey: '',
				baseUrl: PROVIDER_DEFAULTS[provider as APIProvider].host,
				isCustom: provider === APIProvider.Custom,
			} as PluginSettings['aiProviderConfig'][APIProvider],
		]),
	),

	enableStatusBarButton: false,

	excludeThinkingOutput: true,

	disableSystemInstructions: false,

	advancedSettings: false,

	enableGenerationLogging: false,
	customPrompts: [],
	disableInternalPrompts: false,
	customPromptsFromFolder: {
		enabled: false,
		path: 'Wordwise',
	},

	enableStreaming: false,

	enableConfirmationModal: false,

	// Custom Behavior
	customBehavior: CustomBehavior.Replace,

	obfuscateConfig: true,
};
