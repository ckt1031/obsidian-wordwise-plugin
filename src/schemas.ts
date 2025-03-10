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
	provider: v.string(),
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

	// Providers
	aiProvider: v.string(),
	aiProviderConfig: v.record(
		v.string(),
		v.object({
			model: v.string(),
			apiKey: v.string(),
			baseUrl: v.string(),

			// New after Azure OpenAI, but not all providers have it
			apiVersion: v.optional(v.string()),

			// New in v1.1.0
			isCustom: v.optional(v.boolean()),
			displayName: v.optional(v.string()),
			doNotAppendV1ToPath: v.optional(v.boolean()),
		}),
	),

	advancedSettings: v.boolean(),
	customAiModel: v.string(),
	maxTokens: v.number(),
	temperature: v.number(),

	/** Thinking and reasoning from model */
	doNotIncludeThinkingContentToFinalText: v.boolean(),

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

export const CommandSchema = v.object({
	name: v.union([v.string(), v.enum_(CommandNames)]),
	icon: v.optional(v.string()),
	action: v.enum_(CommandActions),
	data: v.string(),
});
