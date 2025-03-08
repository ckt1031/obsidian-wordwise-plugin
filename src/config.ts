import type { PluginSettings } from './types';

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
	doNotIncludeThinkingContentToFinalText: true,
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
