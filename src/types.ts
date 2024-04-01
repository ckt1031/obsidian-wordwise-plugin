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
import type WordWisePlugin from './main';

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

export const GoogleGenAIModelsSchema = object({
	models: array(
		object({
			name: string(),
			// version: string(),
			displayName: string(),
			// description: string(),
			// inputTokenLimit: number(),
			// outputTokenLimit: number(),
			supportedGenerationMethods: array(string()),
			// temperature: number(),
			// topP: number(),
			// topK: number(),
		}),
	),
});

export const OpenAIModelsSchema = object({
	data: array(object({ id: string(), name: optional(string()) })),
});

export type GoogleGenAIModels = Output<typeof GoogleGenAIModelsSchema>;
export type OpenAIModels = Output<typeof OpenAIModelsSchema>;
export type UniformModels = {
	id: string;
	name?: string | undefined;
}[];

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
		[APIProvider.PerplexityAI]: object({
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
	messages: {
		system: string;
		user: string;
	};
}

export interface ProviderTextAPIProps extends CallTextAPIProps {
	model: string;
}

export interface ComandProps {
	name: string;
	icon: string | undefined;
	action: CommandActions;
	taskPrompt: string;
	systemPrompt: string;
}

export const TextGenerationLogSchema = object({
	id: string(),

	by: string(),
	model: string(),
	provider: enum_(APIProvider),
	generatedAt: string(),

	customInstruction: optional(string()),

	orginalText: string(),
	generatedText: string(),
});

export type TextGenerationLog = Output<typeof TextGenerationLogSchema>;
