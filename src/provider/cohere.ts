import { requestUrl } from 'obsidian';

import { parseAsync } from 'valibot';

import { APIProvider, PROVIDER_DEFAULTS } from '@/config';
import { CohereModelsSchema } from '@/schemas/models';
import type { Models } from '@/types';
import type { ModelRequestProps } from './openai';

export async function getCohereModels({
	host,
	apiKey,
}: ModelRequestProps): Promise<Models> {
	const path = PROVIDER_DEFAULTS[APIProvider.Cohere].models;
	const url = `${host}${path}`;

	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
		Authorization: `Bearer ${apiKey}`,
	};

	const response = await requestUrl({
		url: url,
		headers: headers,
	});

	if (response.status !== 200) {
		throw new Error(response.text);
	}

	const { models } = await parseAsync(CohereModelsSchema, response.json);

	const list: Models = [];

	for (const model of models) {
		const endpoint = model.endpoints ?? [];

		if (!endpoint.includes('chat') || !model.name) {
			continue;
		}

		list.push({
			id: model.name,
			name: model.name,
		});
	}

	return list;
}
