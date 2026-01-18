import { requestUrl } from 'obsidian';

import { createOllama } from 'ai-sdk-ollama';
import { parseAsync } from 'valibot';

import { APIProvider, PROVIDER_DEFAULTS } from '@/config';
import { OllamaModelsSchema } from '@/schemas/models';
import type { Models, ProviderTextAPIProps } from '@/types';
import { getAPIHost } from '@/utils/get-url-host';
import { BaseProvider } from './base';

export type ModelRequestProps = {
	host: string;
	apiKey: string;
};

export async function getOllamaModels({
	host,
	apiKey,
}: ModelRequestProps): Promise<Models> {
	const response = await requestUrl({
		url: `${host}/api/tags`,
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${apiKey}`,
		},
	});

	if (response.status !== 200) {
		throw new Error(response.text);
	}

	const models = await parseAsync(OllamaModelsSchema, response.json);

	return models.models.map((model) => ({
		id: model.name,
		name: `${model.name} (${model.details.parameter_size})`,
	}));
}

export class OllamaProvider extends BaseProvider {
	protected createModel(
		modelId: string,
		providerSettings: ProviderTextAPIProps['providerSettings'],
		_provider: string,
	) {
		const { baseUrl } = providerSettings;

		const host = getAPIHost(
			baseUrl,
			PROVIDER_DEFAULTS[APIProvider.Ollama].host,
		);

		const ollama = createOllama({
			baseURL: host,
		});

		return ollama(modelId);
	}
}

export async function handleTextOllama(props: ProviderTextAPIProps) {
	return new OllamaProvider().handleText(props);
}
