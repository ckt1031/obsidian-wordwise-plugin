import { DEFAULT_HOST } from '@/config';
import { AnthropicModelsSchema } from '@/schemas/models';
import type { Models, ProviderTextAPIProps } from '@/types';
import { getAPIHost } from '@/utils/get-url-host';
import { requestUrl } from 'obsidian';
import { parseAsync } from 'valibot';

export async function getAnthropicModels({
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
		'anthropic-version': '2023-06-01',
		'x-api-key': providerSettings.apiKey,
	};

	const response = await requestUrl({
		url,
		method: 'GET',
		headers: headers,
	});

	if (response.status !== 200) {
		throw new Error(response.text);
	}

	const data = await parseAsync(
		AnthropicModelsSchema,
		JSON.parse(response.text),
	);

	const list: Models = [];

	for (const model of data.models) {
		list.push({
			id: model.id,
			name: model.displayName,
		});
	}

	return list;
}
