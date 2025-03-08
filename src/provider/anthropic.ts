import { DEFAULT_HOST } from '@/config';
import { AnthropicModelsSchema } from '@/schemas/models';
import type { Models, ProviderTextAPIProps } from '@/types';
import { getAPIHost } from '@/utils/get-url-host';
import isV1Needed from '@/utils/is-v1-needed';
import type {
	Message,
	MessageCreateParams,
} from '@anthropic-ai/sdk/resources/messages';
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

export async function handleTextAnthropicAI({
	plugin,
	messages,
	model,
}: ProviderTextAPIProps) {
	const { settings } = plugin;

	const providerSettings = settings.aiProviderConfig[settings.aiProvider];

	const body: MessageCreateParams = {
		messages: [
			{
				role: 'user',
				content: messages.user,
			},
		],
		system: messages.system,
		model,
		stream: false,
		max_tokens:
			settings.advancedSettings && settings.maxTokens !== 0
				? settings.maxTokens
				: 2048,
		temperature: settings.advancedSettings ? settings.temperature : 0.5,
	};

	const urlHost = getAPIHost(
		providerSettings.baseUrl,
		DEFAULT_HOST[settings.aiProvider],
	);

	const versionPath = isV1Needed(urlHost) ? '/v1' : '';

	const url = `${urlHost}${versionPath}/messages`;

	const response = await requestUrl({
		url,
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'anthropic-version': '2023-06-01',
			'x-api-key': providerSettings.apiKey,
		},
		body: JSON.stringify(body),
	});

	if (response.status !== 200) {
		throw new Error(response.text);
	}

	const content: Message['content'][0] = JSON.parse(response.text).content[0];

	if (content.type !== 'text') {
		throw new Error('No text generated');
	}

	return content.text;
}
