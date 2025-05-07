import * as v from 'valibot';

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
