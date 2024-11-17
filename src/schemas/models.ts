import * as v from 'valibot';

export const OpenAIModelsSchema = v.object({
	data: v.array(
		v.object({
			id: v.string(),
			name: v.optional(v.string()),
		}),
	),
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
