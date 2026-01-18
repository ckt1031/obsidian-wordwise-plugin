import { requestUrl } from 'obsidian';

import { createAnthropic } from '@ai-sdk/anthropic';
import { parseAsync } from 'valibot';

import { APIProvider, PROVIDER_DEFAULTS } from '@/config';
import { AnthropicModelsSchema } from '@/schemas/models';
import type { Models, ProviderTextAPIProps } from '@/types';
import { getAPIHost } from '@/utils/get-url-host';
import { BaseProvider } from './base';
import type { ModelRequestProps } from './openai';

export async function getAnthropicModels({
	host,
	apiKey,
}: ModelRequestProps): Promise<Models> {
	const path = PROVIDER_DEFAULTS[APIProvider.Anthropic].models;
	const url = `${host}${path}`;

	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
		'anthropic-version': '2023-06-01',
		'x-api-key': apiKey,
	};

	const response = await requestUrl({
		url: url,
		headers: headers,
	});

	if (response.status !== 200) {
		throw new Error(response.text);
	}

	const data = await parseAsync(AnthropicModelsSchema, response.json);

	const list: Models = [];

	for (const model of data.models) {
		list.push({
			id: model.id,
			name: model.displayName,
		});
	}

	return list;
}

export class AnthropicProvider extends BaseProvider {
	protected createModel(
		modelId: string,
		providerSettings: ProviderTextAPIProps['providerSettings'],
	) {
		const { apiKey, baseUrl } = providerSettings;

		let host = getAPIHost(
			baseUrl,
			PROVIDER_DEFAULTS[APIProvider.Anthropic].host,
		);

		host = `${host}/v1`;

		const anthropic = createAnthropic({
			apiKey,
			baseURL: host,
		});

		return anthropic(modelId);
	}
}

export async function handleTextAnthropic(props: ProviderTextAPIProps) {
	return new AnthropicProvider().handleText(props);
}
