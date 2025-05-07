import { parseAsync } from 'valibot';

import { MistralModelsSchema } from '@/schemas/models';
import type { Models } from '@/types';

export type ModelRequestProps = {
	host: string;
	apiKey: string;
	provider: string;
};

export async function getMistralModels({
	host,
	apiKey,
	provider,
}: ModelRequestProps): Promise<Models> {
	const response = await fetch(`${host}/v1/models`, {
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${apiKey}`,
		},
	});

	if (response.status !== 200) {
		throw new Error(await response.text());
	}

	const models = await parseAsync(MistralModelsSchema, await response.json());

	// Filter off models with name embed, whisper, tts
	models.data = models.data.filter(
		(model) => model.capabilities.completion_chat,
	);

	return models.data.map((model) => ({
		id: model.id,
		name: model.id,
		provider,
	}));
}
