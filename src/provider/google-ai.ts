import { parseAsync } from 'valibot';

import { GoogleGenAIModelsSchema } from '@/schemas/models';
import type { Models } from '@/types';
import type { ModelRequestProps } from './openai';

export async function getGoogleGenAIModels({
	host,
	apiKey,
}: ModelRequestProps): Promise<Models> {
	const url = `${host}/v1beta/models?key=${apiKey}`;

	const response = await fetch(url);

	if (response.status !== 200) {
		throw new Error(await response.text());
	}

	const data = await parseAsync(GoogleGenAIModelsSchema, await response.json());

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
