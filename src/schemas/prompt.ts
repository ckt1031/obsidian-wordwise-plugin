import * as v from 'valibot';
import { APIProvider, InternalPromptNames, PrePromptActions } from '../config';

export const FilePromptPropertiesSchema = v.object({
	// REQUIRED
	name: v.string(),

	// OPTIONAL
	disabled: v.optional(v.boolean()),
	model: v.optional(v.string()),
	provider: v.optional(v.union([v.enum_(APIProvider), v.string()])),
	systemPrompt: v.optional(v.string()),
});

export const InputPromptSchema = v.object({
	// Required Values
	name: v.union([v.string(), v.enum_(InternalPromptNames)]),

	/** Body prompt, will be passed in system message in LLM API */
	data: v.string(),

	filePath: v.optional(v.string()),
	systemPrompt: v.optional(v.string()),

	// Optional Values
	action: v.optional(v.enum_(PrePromptActions)),
	icon: v.optional(v.string()),
	isFilePrompt: v.optional(v.boolean()),
	customPromptDefinedModel: v.optional(v.string()),
	customPromptDefinedProvider: v.optional(v.string()),
});
