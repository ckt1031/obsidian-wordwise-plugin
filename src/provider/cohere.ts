import { DEFAULT_HOST } from '@/config';
import type { Models, ProviderTextAPIProps } from '@/types';
import { getAPIHost } from '@/utils/get-url-host';
import type {
	ChatRequest,
	ListModelsResponse,
	NonStreamedChatResponse,
} from 'cohere-ai/api';
import { request } from 'obsidian';
import snakecaseKeys from 'snakecase-keys';

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

	const response = await request({
		url,
		method: 'GET',
		headers: headers,
	});

	const allModels = JSON.parse(response) as ListModelsResponse;

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

export async function handleTextCohere({
	plugin,
	messages,
	model,
}: ProviderTextAPIProps) {
	const { settings } = plugin;

	const providerSettings = settings.aiProviderConfig[settings.aiProvider];

	const body: ChatRequest = {
		model,
		message: `${messages.system}\n\n${messages.user}`,
		temperature: settings.advancedSettings ? settings.temperature : 0.5,
		maxTokens: settings.advancedSettings ? settings.maxTokens : 2000,
		frequencyPenalty: settings.advancedSettings
			? settings.frequencyPenalty
			: 0.0,
	};

	const url = `${getAPIHost(
		providerSettings.baseUrl,
		DEFAULT_HOST[settings.aiProvider],
	)}/v1/chat`;

	const response = await request({
		url,
		method: 'POST',
		headers: {
			accept: 'application/json',
			'Content-Type': 'application/json',
			Authorization: `Bearer ${providerSettings.apiKey}`,
		},
		body: JSON.stringify(
			snakecaseKeys(body as unknown as Record<string, unknown>),
		),
	});

	console.log(response);

	const { text }: NonStreamedChatResponse = JSON.parse(response);

	return text;
}
