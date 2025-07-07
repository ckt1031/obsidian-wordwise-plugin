import * as v from 'valibot';

import { CustomBehavior } from '@/config';
import { InputPromptSchema } from './prompt';

export const ObfuscatedPluginSettingsSchema = v.object({
	_NOTICE: v.string(),
	z: v.string(),
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

			maxTokens: v.optional(v.number()),
			temperature: v.optional(v.number()),

			customModelId: v.optional(v.string()),
		}),
	),

	advancedSettings: v.boolean(),

	/** Exclusive to desktop view */
	enableStatusBarButton: v.boolean(),

	/** Thinking and reasoning from model */
	excludeThinkingOutput: v.boolean(),

	/** Disable system instructions for compatibility */
	disableSystemInstructions: v.boolean(),

	/** Log the text to storage to trace usage and original text */
	enableGenerationLogging: v.boolean(),

	customPrompts: v.array(InputPromptSchema),

	disableInternalPrompts: v.boolean(),

	customPromptsFromFolder: v.object({
		enabled: v.boolean(),
		path: v.string(),
	}),

	/** Enable streaming view to UI, this will enforce `enableConfirmationModal` to be true */
	enableStreaming: v.boolean(),

	/** Show a confirmation UI before inserting generated text */
	enableConfirmationModal: v.boolean(),

	// What to do with the generated text and the original text
	customBehavior: v.enum_(CustomBehavior),

	obfuscateConfig: v.boolean(),
});
