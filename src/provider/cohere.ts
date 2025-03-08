import { DEFAULT_HOST } from '@/config';
import type { Models, ProviderTextAPIProps } from '@/types';
import { getAPIHost } from '@/utils/get-url-host';
import type { ListModelsResponse } from 'cohere-ai/api';
import { requestUrl } from 'obsidian';

export async function getCohereModels({
	plugin,
}: Pick<ProviderTextAPIProps, 'plugin'>): Promise<Models> {
	const { settings } = plugin;
	const providerSettings = settings.aiProviderConfig[settings.aiProvider];

	const host = getAPIHost(
		providerSettings.baseUrl,
		DEFAULT_HOST[settings.aiProvider],
	);

	const url = `${host}/v1/models`;

	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
		Authorization: `Bearer ${providerSettings.apiKey}`,
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
