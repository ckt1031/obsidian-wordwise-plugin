import * as v from 'valibot';

import { APIProvider, InternalPromptNames, PrePromptActions } from '../config';

export const FilePromptPropertiesSchema = v.object({
	// REQUIRED
	name: v.string(),

	// OPTIONAL
	disabled: v.optional(v.boolean()),
	model: v.optional(v.string()),
	provider: v.optional(v.union([v.enum_(APIProvider), v.string()])),
	/** Text or Markdown file path (Relative to the Obsidian vault)
	 *
	 * OS Absolute path and Relative path to the markdown file **are not supported**.
	 */
	systemPrompt: v.optional(v.string()),
	icon: v.optional(v.string()),
	behavior: v.optional(v.string()),
	omitOriginal: v.optional(v.boolean()),
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

	// File prompt properties
	isFilePrompt: v.optional(v.boolean()),

	// Customized values for the prompt
	customBehavior: v.optional(v.string()),
	customPromptDefinedModel: v.optional(v.string()),
	customPromptDefinedProvider: v.optional(v.string()),
	excludeOriginalText: v.optional(v.boolean()),
});

export type InputPrompt = v.InferOutput<typeof InputPromptSchema>;
