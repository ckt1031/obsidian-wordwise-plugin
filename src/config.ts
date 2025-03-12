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
	/** https://ollama.com */
	Ollama = 'Ollama',
	/** https://lmstudio.ai/docs/app/api/endpoints/openai */
	LMStudio = 'LM Studio',

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
	[APIProvider.LMStudio]: 'http://localhost:1234',
	[APIProvider.Custom]: '',
};

export const DEFAULT_SETTINGS: PluginSettings = {
	dataSchemeDate: new Date('2024-04-15').toISOString(),

	aiProvider: APIProvider.OpenAI,
	aiProviderConfig: Object.fromEntries(
		Object.entries(APIProvider).map(([key, provider]) => [
			provider,
			{
				model: '',
				apiKey: '',
				baseUrl: key,
				isCustom: provider === APIProvider.Custom,
			} as PluginSettings['aiProviderConfig'][APIProvider],
		]),
	),

	excludeThinkingOutput: true,

	advancedSettings: false,
	customAiModel: '',
	maxTokens: 2000,
	temperature: 0.6,
	enableGenerationLogging: false,
	customPrompts: [],
	disableNativeCommands: false,
	customPromptsFromFolder: {
		enabled: false,
		path: 'Wordwise',
	},

	// Custom Behavior
	customBehavior: CustomBehavior.Replace,
};
