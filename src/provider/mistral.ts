import { requestUrl } from 'obsidian';

import { parseAsync } from 'valibot';

import { APIProvider, PROVIDER_DEFAULTS } from '@/config';
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
	const path = PROVIDER_DEFAULTS[APIProvider.Mistral].models;
	const response = await requestUrl({
		url: `${host}${path}`,
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${apiKey}`,
		},
	});

	if (response.status !== 200) {
		throw new Error(response.text);
	}

	const models = await parseAsync(MistralModelsSchema, response.json);

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
