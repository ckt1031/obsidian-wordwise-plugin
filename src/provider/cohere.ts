import { DEFAULT_HOST } from '@/config';
import type { Models, ProviderTextAPIProps } from '@/types';
import { getAPIHost } from '@/utils/get-url-host';
import type {
	ChatResponse,
	ListModelsResponse,
	V2ChatRequest,
} from 'cohere-ai/api';
import { requestUrl } from 'obsidian';
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

export async function handleTextCohere({
	plugin,
	messages,
	model,
}: ProviderTextAPIProps) {
	const { settings } = plugin;

	const providerSettings = settings.aiProviderConfig[settings.aiProvider];

	const body: V2ChatRequest = {
		model,
		messages: [
			{
				role: 'system',
				content: messages.system,
			},
			{
				role: 'user',
				content: messages.user,
			},
		],
		...(settings.advancedSettings && {
			...(settings.maxTokens > 0 && {
				maxTokens: settings.maxTokens,
			}),
			temperature: settings.temperature,
		}),
	};

	const url = `${getAPIHost(
		providerSettings.baseUrl,
		DEFAULT_HOST[settings.aiProvider],
	)}/v1/chat`;

	const response = await requestUrl({
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

	if (response.status !== 200) {
		throw new Error(response.text);
	}

	const { message }: ChatResponse = JSON.parse(response.text);

	if (!message.content) {
		throw new Error('No content found in response');
	}

	return message.content[0].text;
}
