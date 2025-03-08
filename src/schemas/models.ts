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
			displayName: v.string(),
			supportedGenerationMethods: v.array(v.string()),
		}),
	),
});

export const AnthropicModelsSchema = v.object({
	models: v.array(
		v.object({
			id: v.string(),
			type: v.string(),
			displayName: v.string(),
		}),
	),
});

export const OllamaModelsSchema = v.object({
	models: v.array(
		v.object({
			name: v.string(),
			details: v.object({
				parameter_size: v.string(),
				quantization_level: v.string(),
			}),
		}),
	),
});
