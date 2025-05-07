import * as v from 'valibot';

export const TextGenerationLogSchema = v.pipe(
	v.object({
		id: v.string(),

		by: v.string(),
		model: v.string(),
		provider: v.string(),
		generatedAt: v.string(),

		customInstruction: v.optional(v.string()),

		/**
		 * @deprecated Typo issue in old version, use `originalText` instead, this will be removed in 2026,
		 * not sure how many users are using it and not updated to the new schema.
		 */
		orginalText: v.optional(v.string()),
		originalText: v.optional(v.string()),

		generatedText: v.string(),
	}),
	v.transform(({ orginalText, originalText, ...rest }) => {
		return {
			...rest,
			originalText: originalText ?? orginalText ?? '',
		};
	}),
);
