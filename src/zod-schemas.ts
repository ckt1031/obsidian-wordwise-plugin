import * as v from 'valibot';
import {
	APIProvider,
	CommandActions,
	CommandNames,
	CustomBehavior,
} from './config';

export const TextGenerationLogSchema = v.object({
	id: v.string(),

	by: v.string(),
	model: v.string(),
	provider: v.enum_(APIProvider),
	generatedAt: v.string(),

	customInstruction: v.optional(v.string()),

	// Typo, but it's already in use, so we can't change it
	orginalText: v.string(),
	generatedText: v.string(),
});

export const ObfuscatedPluginSettingsSchema = v.object({
	_NOTICE: v.string(),
	z: v.string(),
});

export const OpenAIModelsSchema = v.object({
	data: v.array(v.object({ id: v.string(), name: v.optional(v.string()) })),
});

export const FilePromptPropertiesSchema = v.object({
	name: v.string(),
	disabled: v.optional(v.boolean()),
	model: v.optional(v.string()),
	provider: v.optional(v.enum_(APIProvider)),
	systemPrompt: v.optional(v.string()),
});

export const CustomPromptSchema = v.object({
	name: v.string(),
	icon: v.optional(v.string()),
	data: v.string(),
});

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

	customPromptsFromFolder: v.object({
		enabled: v.boolean(),
		path: v.string(),
	}),

	// Custom Behavior
	customBehavior: v.enum_(CustomBehavior),
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

export const PromptSchema = v.object({
	name: v.union([v.string(), v.enum_(CommandNames)]),
	icon: v.optional(v.string()),
	action: v.enum_(CommandActions),
	data: v.string(),
});
