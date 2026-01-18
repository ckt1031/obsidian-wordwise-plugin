import { requestUrl } from 'obsidian';

import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { parseAsync } from 'valibot';

import { APIProvider, PROVIDER_DEFAULTS } from '@/config';
import { GoogleGenAIModelsSchema } from '@/schemas/models';
import type { Models, ProviderTextAPIProps } from '@/types';
import { getAPIHost } from '@/utils/get-url-host';
import { BaseProvider } from './base';
import type { ModelRequestProps } from './openai';

export async function getGoogleGenAIModels({
	host,
	apiKey,
}: ModelRequestProps): Promise<Models> {
	const path = PROVIDER_DEFAULTS[APIProvider.GoogleGemini].models;
	const url = `${host}${path}?key=${apiKey}`;

	const response = await requestUrl(url);

	if (response.status !== 200) {
		throw new Error(response.text);
	}

	const data = await parseAsync(GoogleGenAIModelsSchema, response.json);

	const list: Models = [];

	for (const model of data.models) {
		if (model.supportedGenerationMethods.includes('generateContent')) {
			list.push({
				id: model.name.replace('models/', ''),
				name: model.displayName,
			});
		}
	}

	return list;
}

export class GoogleAIProvider extends BaseProvider {
	protected createModel(
		modelId: string,
		providerSettings: ProviderTextAPIProps['providerSettings'],
	) {
		const { apiKey, baseUrl } = providerSettings;

		let host = getAPIHost(
			baseUrl,
			PROVIDER_DEFAULTS[APIProvider.GoogleGemini].host,
		);

		host = `${host}/v1beta`;

		const google = createGoogleGenerativeAI({
			apiKey,
			baseURL: host,
		});

		return google(modelId);
	}
}

export async function handleTextGoogle(props: ProviderTextAPIProps) {
	return new GoogleAIProvider().handleText(props);
}
