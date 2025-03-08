import { DEFAULT_HOST } from '@/config';
import { GoogleGenAIModelsSchema } from '@/schemas/models';
import type { Models, ProviderTextAPIProps } from '@/types';
import { getAPIHost } from '@/utils/get-url-host';
import { requestUrl } from 'obsidian';
import { parseAsync } from 'valibot';

export async function getGoogleGenAIModels({
	plugin,
}: Pick<ProviderTextAPIProps, 'plugin'>): Promise<Models> {
	const { settings } = plugin;
	const providerSettings = settings.aiProviderConfig[settings.aiProvider];

	const host = getAPIHost(
		providerSettings.baseUrl,
		DEFAULT_HOST[settings.aiProvider],
	);

	const url = `${host}/v1beta/models?key=${providerSettings.apiKey}`;

	const response = await requestUrl(url);

	if (response.status !== 200) {
		throw new Error(response.text);
	}

	const data = await parseAsync(
		GoogleGenAIModelsSchema,
		JSON.parse(response.text),
	);

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
