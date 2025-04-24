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
	// REQUIRED
	name: v.string(),

	// OPTIONAL
	disabled: v.optional(v.boolean()),
	model: v.optional(v.string()),
	provider: v.optional(v.enum_(APIProvider)),
	systemPrompt: v.optional(v.string()),
});

export const InputCommandSchema = v.object({
	// Required Values
	name: v.union([v.string(), v.enum_(CommandNames)]),

	/** Body prompt, will be passed in system message in LLM API */
	data: v.string(),

	filePath: v.optional(v.string()),
	systemPrompt: v.optional(v.string()),

	// Optional Values
	action: v.optional(v.enum_(CommandActions)),
	icon: v.optional(v.string()),
	isFilePrompt: v.optional(v.boolean()),
	customCommandDefinedModel: v.optional(v.string()),
	customCommandDefinedProvider: v.optional(v.string()),
});

export const PluginSettingsSchema = v.object({
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
			omitVersionPrefix: v.optional(v.boolean()),
		}),
	),

	advancedSettings: v.boolean(),
	customAiModel: v.string(),
	maxTokens: v.number(),
	temperature: v.number(),

	/** Exclusive to desktop view */
	enableStatusBarButton: v.boolean(),

	/** Thinking and reasoning from model */
	excludeThinkingOutput: v.boolean(),

	/** Disable system instructions for compatibility */
	disableSystemInstructions: v.boolean(),

	/** Log the text to storage to trace usage and original text */
	enableGenerationLogging: v.boolean(),

	customPrompts: v.array(InputCommandSchema),

	disableNativeCommands: v.boolean(),

	customPromptsFromFolder: v.object({
		enabled: v.boolean(),
		path: v.string(),
	}),

	/** Enable streaming view to UI, this will enforce `enableConfirmationModal` to be true */
	enableStreaming: v.boolean(),

	/** Show a confirmation UI before inserting generated text */
	enableConfirmationModal: v.boolean(),

	// Custom Behavior
	customBehavior: v.enum_(CustomBehavior),
});
