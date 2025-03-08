import type { Models } from '@/types';
import type { ListModelsResponse } from 'cohere-ai/api';
import { requestUrl } from 'obsidian';
import type { ModelRequestProps } from './openai';

export async function getCohereModels({
	host,
	apiKey,
}: ModelRequestProps): Promise<Models> {
	const url = `${host}/v1/models`;

	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
		Authorization: `Bearer ${apiKey}`,
	};

	const response = await requestUrl({
		url,
		method: 'GET',
		headers: headers,
	});

	if (response.status !== 200) {
		throw new Error(response.text);
	}

	const allModels = JSON.parse(response.text) as ListModelsResponse;

	const list: Models = [];

	for (const model of allModels.models) {
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
