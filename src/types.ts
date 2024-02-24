import {
	type Output,
	array,
	boolean,
	enum_,
	number,
	object,
	optional,
	string,
	union,
} from 'valibot';
import { APIProvider, CommandActions, CommandNames } from './config';
import WordWisePlugin from './main';

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

export const OpenAIModelsSchema = object({
	data: array(object({ id: string(), name: optional(string()) })),
});

export type OpenAIModels = Output<typeof OpenAIModelsSchema>;

export const PluginSettingsSchema = object({
	/** Date that helps migration */
	dataSchemeDate: string(),

	aiProvider: enum_(APIProvider),
	aiProviderConfig: object({
		[APIProvider.OpenAI]: object({
			apiKey: string(),
			baseUrl: string(),
			model: string(),
		}),
		[APIProvider.AzureOpenAI]: object({
			apiKey: string(),
			baseUrl: string(),
			model: string(),
			apiVersion: string(),
		}),
		[APIProvider.GoogleGemini]: object({
			apiKey: string(),
			baseUrl: string(),
			model: string(),
		}),
		[APIProvider.Anthropic]: object({
			apiKey: string(),
			baseUrl: string(),
			model: string(),
		}),
		[APIProvider.Cohere]: object({
			apiKey: string(),
			baseUrl: string(),
			model: string(),
		}),
		[APIProvider.OpenRouter]: object({
			apiKey: string(),
			baseUrl: string(),
			model: string(),
		}),
		[APIProvider.Custom]: object({
			apiKey: string(),
			baseUrl: string(),
			model: string(),
		}),
	}),

	advancedSettings: boolean(),
	customAiModel: string(),
	maxTokens: number(),
	temperature: number(),
	presencePenalty: number(),
	frequencyPenalty: number(),

	/** Log the text to storage to trace usage and original text */
	enableGenerationLogging: boolean(),

	/** Enable logging */
	debugMode: boolean(),

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

export interface CallTextAPIProps {
	plugin: WordWisePlugin;
	userMessage: string;
}

export interface ProviderTextAPIProps extends CallTextAPIProps {
	customAiModel: string;
}

export const TextGenerationLogSchema = object({
	by: string(),
	model: string(),
	provider: enum_(APIProvider),
	generatedAt: string(),

	customInstruction: optional(string()),

	orginalText: string(),
	generatedText: string(),
});

export type TextGenerationLog = Output<typeof TextGenerationLogSchema>;
