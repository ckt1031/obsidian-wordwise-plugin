import {
	type Output,
	array,
	boolean,
	date,
	enum_,
	number,
	object,
	optional,
	string,
	union,
} from 'valibot';

export enum APIProvider {
	OpenAI = 'OpenAI',
	GoogleGemini = 'Google Gemini',
	Anthropic = 'Anthropic',
}

export enum CommandNames {
	ImproveWriting = 'Improve Writing',
	FixGrammar = 'Fix Grammar',
	SimplifyText = 'Simplify Text',
	MakeShorter = 'Make Shorter',
	MakeLonger = 'Make Longer',
	Paraphrase = 'Paraphrase',
	HighlightMainPoint = 'Highlight Main Point',

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

export const PromptSchema = object({
	name: union([string(), enum_(CommandNames)]),
	icon: optional(string()),
	action: enum_(CommandActions),
	data: string(),
});

export type Prompt = Output<typeof PromptSchema>;

export const CustomPromptSchema = object({
	name: string(),
	icon: optional(string()),
	data: string(),
});

export const PluginSettingsSchema = object({
	dataSchemeDate: string(),

	apiProvider: enum_(APIProvider),

	openAiApiKey: string(),
	openAiBaseUrl: string(),
	openAiModel: string(),

	anthropicApiKey: string(),
	anthropicBaseUrl: string(),
	anthropicModel: string(),

	googleAIApiKey: string(),
	googleAIBaseUrl: string(),
	googleAIModel: string(),

	advancedSettings: boolean(),
	customAiModel: string(),
	maxTokens: number(),
	temperature: number(),
	presencePenalty: number(),
	frequencyPenalty: number(),
	debugMode: boolean(),

	// Custom Prompt Settings
	customPrompts: array(CustomPromptSchema),
});

export type PluginSettings = Output<typeof PluginSettingsSchema>;

export const ObfuscatedPluginSettingsSchema = object({
	_NOTICE: string(),
	z: string(),
});

export type ObfuscatedPluginSettings = Output<
	typeof ObfuscatedPluginSettingsSchema
>;

export interface OpenAiKeyCredit {
	consumedCredits: number;
	remainingCredits: number;
	totalCredits: number;
	expiryDate: string;
}

export interface CallAPIProps {
	settings: PluginSettings;
	userMessage: string;
}

export interface AIProviderProps extends CallAPIProps {
	customAiModel: string;
}
