import * as v from 'valibot';
import { APIProvider, CommandActions, CommandNames } from './config';
import type WordWisePlugin from './main';

export const PromptSchema = v.object({
	name: v.union([v.string(), v.enum_(CommandNames)]),
	icon: v.optional(v.string()),
	action: v.enum_(CommandActions),
	data: v.string(),
});

export type Prompt = v.InferInput<typeof PromptSchema>;

export const CustomPromptSchema = v.object({
	name: v.string(),
	icon: v.optional(v.string()),
	data: v.string(),
});

export const GoogleGenAIModelsSchema = v.object({
	models: v.array(
		v.object({
			name: v.string(),
			// version: string(),
			displayName: v.string(),
			// description: string(),
			// inputTokenLimit: number(),
			// outputTokenLimit: number(),
			supportedGenerationMethods: v.array(v.string()),
			// temperature: number(),
			// topP: number(),
			// topK: number(),
		}),
	),
});

export const OpenAIModelsSchema = v.object({
	data: v.array(v.object({ id: v.string(), name: v.optional(v.string()) })),
});

export type GoogleGenAIModels = v.InferInput<typeof GoogleGenAIModelsSchema>;
export type OpenAIModels = v.InferInput<typeof OpenAIModelsSchema>;
export type UniformModels = {
	id: string;
	name?: string | undefined;
}[];

export const PluginSettingsSchema = v.object({
	/** Date that helps migration */
	dataSchemeDate: v.string(),

	aiProvider: v.enum_(APIProvider),
	aiProviderConfig: v.object({
		[APIProvider.OpenAI]: v.object({
			apiKey: v.string(),
			baseUrl: v.string(),
			model: v.string(),
		}),
		[APIProvider.AzureOpenAI]: v.object({
			apiKey: v.string(),
			baseUrl: v.string(),
			model: v.string(),
			apiVersion: v.string(),
		}),
		[APIProvider.GoogleGemini]: v.object({
			apiKey: v.string(),
			baseUrl: v.string(),
			model: v.string(),
		}),
		[APIProvider.Anthropic]: v.object({
			apiKey: v.string(),
			baseUrl: v.string(),
			model: v.string(),
		}),
		[APIProvider.Cohere]: v.object({
			apiKey: v.string(),
			baseUrl: v.string(),
			model: v.string(),
		}),
		[APIProvider.OpenRouter]: v.object({
			apiKey: v.string(),
			baseUrl: v.string(),
			model: v.string(),
		}),
		[APIProvider.PerplexityAI]: v.object({
			apiKey: v.string(),
			baseUrl: v.string(),
			model: v.string(),
		}),
		[APIProvider.Custom]: v.object({
			apiKey: v.string(),
			baseUrl: v.string(),
			model: v.string(),
		}),
	}),

	advancedSettings: v.boolean(),
	customAiModel: v.string(),
	maxTokens: v.number(),
	temperature: v.number(),
	presencePenalty: v.number(),
	frequencyPenalty: v.number(),

	/** Log the text to storage to trace usage and original text */
	enableGenerationLogging: v.boolean(),

	/** Enable logging */
	debugMode: v.boolean(),

	customPrompts: v.array(CustomPromptSchema),

	disableNativeCommands: v.boolean(),
	customPromptsFileBased: v.object({
		enabled: v.boolean(),
		filePath: v.string(),
	}),
});

export type PluginSettings = v.InferInput<typeof PluginSettingsSchema>;

export const ObfuscatedPluginSettingsSchema = v.object({
	_NOTICE: v.string(),
	z: v.string(),
});

export type ObfuscatedPluginSettings = v.InferInput<
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

export const TextGenerationLogSchema = v.object({
	id: v.string(),

	by: v.string(),
	model: v.string(),
	provider: v.enum_(APIProvider),
	generatedAt: v.string(),

	customInstruction: v.optional(v.string()),

	orginalText: v.string(),
	generatedText: v.string(),
});

export type TextGenerationLog = v.InferInput<typeof TextGenerationLogSchema>;
