import { requestUrl } from 'obsidian';

import { createCohere } from '@ai-sdk/cohere';
import { parseAsync } from 'valibot';

import { APIProvider, PROVIDER_DEFAULTS } from '@/config';
import { CohereModelsSchema } from '@/schemas/models';
import type { Models, ProviderTextAPIProps } from '@/types';
import { getAPIHost } from '@/utils/get-url-host';
import { BaseProvider } from './base';
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

export class CohereProvider extends BaseProvider {
	protected createModel(
		modelId: string,
		providerSettings: ProviderTextAPIProps['providerSettings'],
	) {
		const { apiKey, baseUrl } = providerSettings;

		let host = getAPIHost(baseUrl, PROVIDER_DEFAULTS[APIProvider.Cohere].host);

		host = `${host}/v1`;

		const cohere = createCohere({
			apiKey,
			baseURL: host,
		});

		return cohere(modelId);
	}
}

export async function handleTextCohere(props: ProviderTextAPIProps) {
	return new CohereProvider().handleText(props);
}
