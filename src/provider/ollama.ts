import { DEFAULT_HOST } from '@/config';
import { OllamaModelsSchema } from '@/schemas/models';
import type { Models, ProviderTextAPIProps } from '@/types';
import { getAPIHost } from '@/utils/get-url-host';
import { requestUrl } from 'obsidian';
import { parseAsync } from 'valibot';

export async function getOllamaModels({
	plugin,
}: Pick<ProviderTextAPIProps, 'plugin'>): Promise<Models> {
	const { settings } = plugin;
	const providerSettings = settings.aiProviderConfig[settings.aiProvider];

	const path = '/api/tags';

	const urlHost = getAPIHost(
		providerSettings.baseUrl,
		DEFAULT_HOST[settings.aiProvider],
	);

	const url = `${urlHost}${path}`;

	const response = await requestUrl({
		url,
		method: 'GET',
	});

	if (response.status !== 200) {
		throw new Error(response.text);
	}

	const data = await parseAsync(OllamaModelsSchema, JSON.parse(response.text));

	const list: Models = [];

	for (const model of data.models) {
		list.push({
			id: model.name,
			name: `${model.name} (${model.details.parameter_size} ${model.details.quantization_level})`,
		});
	}

	return list;
}

export async function handleTextOllama({
	plugin,
	messages,
	model,
}: ProviderTextAPIProps) {
	const { settings } = plugin;

	const providerSettings = settings.aiProviderConfig[settings.aiProvider];

	const path = '/api/generate';

	const urlHost = getAPIHost(
		providerSettings.baseUrl,
		DEFAULT_HOST[settings.aiProvider],
	);

	const body = {
		model,
		prompt: messages.user,
		system: messages.system,
		stream: false,
		options: {
			temperature: settings.advancedSettings ? settings.temperature : 0.5,
		},
	};

	const url = `${urlHost}${path}`;

	const response = await requestUrl({
		url,
		method: 'POST',
		body: JSON.stringify(body),
	});

	if (response.status !== 200) {
		throw new Error(response.text);
	}

	const { response: text } = JSON.parse(response.text);

	if (typeof text !== 'string') {
		throw new Error('Invalid response');
	}

	return text;
}
