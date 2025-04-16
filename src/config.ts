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
	[APIProvider.AzureOpenAI]: '', // Must be set by user
	[APIProvider.GoogleGemini]: 'https://generativelanguage.googleapis.com',
	[APIProvider.Anthropic]: 'https://api.anthropic.com',
	[APIProvider.Cohere]: 'https://api.cohere.ai',
	[APIProvider.OpenRouter]: 'https://openrouter.ai',
	[APIProvider.PerplexityAI]: 'https://api.perplexity.ai',
	[APIProvider.Ollama]: 'http://localhost:11434',
	[APIProvider.LMStudio]: 'http://localhost:1234',
	[APIProvider.DeepSeek]: 'https://api.deepseek.com',
	[APIProvider.Mistral]: 'https://api.mistral.ai',
	[APIProvider.XAI]: 'https://api.x.ai',
	[APIProvider.GitHub]: 'https://models.inference.ai.azure.com',

	// Placeholder for custom API
	[APIProvider.Custom]: '',
};

export const DEFAULT_SETTINGS: PluginSettings = {
	aiProvider: APIProvider.OpenAI,
	aiProviderConfig: Object.fromEntries(
		Object.entries(APIProvider).map(([_, provider]) => [
			provider,
			{
				model: '',
				apiKey: '',
				baseUrl: DEFAULT_HOST[provider],
				isCustom: provider === APIProvider.Custom,
			} as PluginSettings['aiProviderConfig'][APIProvider],
		]),
	),

	excludeThinkingOutput: true,

	disableSystemInstructions: false,

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

	showConfirmationModal: false,

	// Custom Behavior
	customBehavior: CustomBehavior.Replace,
};
