import { requestUrl } from 'obsidian';

import { createOpenAI } from '@ai-sdk/openai';
import { parseAsync } from 'valibot';

import { APIProvider, PROVIDER_DEFAULTS } from '@/config';
import { OpenAIModelsSchema } from '@/schemas/models';
import type { Models, ProviderTextAPIProps } from '@/types';
import { getAPIHost } from '@/utils/get-url-host';
import { BaseProvider } from './base';

export type ModelRequestProps = {
	host: string;
	apiKey: string;
	provider: string;
};

export async function getOpenAIModels({
	host,
	apiKey,
	provider,
}: ModelRequestProps): Promise<Models> {
	const defaultEndpoints = PROVIDER_DEFAULTS[provider as APIProvider];

	const path = defaultEndpoints?.models || '/models';

	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
		Authorization: `Bearer ${apiKey}`,
	};

	const response = await requestUrl({
		url: `${host}${path}`,
		headers,
	});

	if (response.status !== 200) {
		throw new Error(response.text);
	}

	const models = await parseAsync(OpenAIModelsSchema, response.json);

	if (provider === APIProvider.OpenAI) {
		// Filter off models with name embed, whisper, tts
		models.data = models.data.filter(
			(model) =>
				!model.id.includes('embed') &&
				!model.id.includes('whisper') &&
				!model.id.includes('tts'),
		);
	}

	return models.data;
}

export class OpenAIProvider extends BaseProvider {
	protected createModel(
		modelId: string,
		providerSettings: ProviderTextAPIProps['providerSettings'],
		provider: string,
	) {
		const { apiKey, baseUrl } = providerSettings;

		const headers: Record<string, string> = {
			Authorization: `Bearer ${apiKey}`,
		};

		let host = getAPIHost(
			baseUrl,
			PROVIDER_DEFAULTS[provider as APIProvider]?.host || '',
		);

		const isCustom = providerSettings.isCustom;

		if (isCustom) {
			host = `${host}${providerSettings.chatPath || '/v1'}`;
		} else {
			host = `${host}/v1`;
		}

		const openai = createOpenAI({
			apiKey,
			baseURL: host,
			headers,
		});

		return openai.chat(modelId);
	}
}

export async function handleTextOpenAI(props: ProviderTextAPIProps) {
	return new OpenAIProvider().handleText(props);
}
