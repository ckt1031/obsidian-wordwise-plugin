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

export const PluginSettingsSchema = object({
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
	}),

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
	plugin: WordWisePlugin;
	userMessage: string;
}

export interface AIProviderProps extends CallAPIProps {
	customAiModel: string;
}
