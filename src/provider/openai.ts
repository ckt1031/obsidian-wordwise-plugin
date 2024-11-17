import { APIProvider, DEFAULT_HOST } from '@/config';
import { OpenAIModelsSchema } from '@/schemas/models';
import type { ProviderTextAPIProps, UniformModels } from '@/types';
import { getAPIHost } from '@/utils/get-url-host';
import isV1Needed from '@/utils/is-v1-needed';
import { Notice, request } from 'obsidian';
import type OpenAI from 'openai';
import { parseAsync } from 'valibot';

const OpenRouterHeaders = {
	'HTTP-Referer': 'https://github.com/ckt1031/obsidian-wordwise-plugin',
	'X-Title': 'Obsidian Wordwise Plugin',
};

export async function getOpenAIModels({
	plugin,
}: Pick<ProviderTextAPIProps, 'plugin'>): Promise<UniformModels> {
	const { settings } = plugin;
	const providerSettings = settings.aiProviderConfig[settings.aiProvider];

	let path = '/v1/models';

	switch (settings.aiProvider) {
		case APIProvider.OpenRouter:
			path = `/api${path}`;
			break;
		default:
			break;
	}

	const host = getAPIHost(
		providerSettings.baseUrl,
		DEFAULT_HOST[settings.aiProvider],
	);

	const url = `${host}${path}`;

	let headers: Record<string, string> = {
		'Content-Type': 'application/json',
	};

	switch (settings.aiProvider) {
		case APIProvider.OpenRouter:
			path = `/api${path}`;
			headers = {
				...headers,
				...OpenRouterHeaders,
				Authorization: `Bearer ${providerSettings.apiKey}`,
			};
			break;
		default:
			headers = {
				...headers,
				Authorization: `Bearer ${providerSettings.apiKey}`,
			};
			break;
	}

	const response = await request({
		url,
		method: 'GET',
		headers: headers,
	});

	const models = await parseAsync(OpenAIModelsSchema, JSON.parse(response));

	if (settings.aiProvider === APIProvider.OpenAI) {
		// Only allow model ame starting with gpt
		models.data = models.data.filter((model) => model.id.startsWith('gpt'));
	}

	return models.data;
}

export async function handleTextOpenAI({
	plugin,
	messages,
	model,
}: ProviderTextAPIProps) {
	const { settings } = plugin;

	const providerSettings = settings.aiProviderConfig[settings.aiProvider];

	if (settings.aiProvider === APIProvider.AzureOpenAI) {
		const providerSettings = settings.aiProviderConfig[settings.aiProvider];

		// Reject if base URL is not set
		if (!providerSettings.baseUrl || providerSettings.baseUrl.length === 0) {
			throw new Error('Base URL is not set');
		}

		// Validate the API Version YYYY-MM-DD
		if (!/\d{4}-\d{2}-\d{2}/.test(providerSettings.apiVersion)) {
			new Notice('Invalid API Version, please enter in YYYY-MM-DD format');
			return;
		}
	}

	let frequency_penalty = settings.advancedSettings
		? settings.frequencyPenalty
		: 0.0;

	if (settings.aiProvider === APIProvider.PerplexityAI) {
		// Set to 1.0 if frequency penalty is 0
		frequency_penalty = frequency_penalty === 0 ? 1.0 : frequency_penalty;
	}

	let body:
		| OpenAI.ChatCompletionCreateParams
		| Omit<OpenAI.ChatCompletionCreateParams, 'model'> = {
		stream: false,
		model,
		temperature: settings.advancedSettings ? settings.temperature : 0.5,
		max_tokens: settings.advancedSettings ? settings.maxTokens : 2000,
		// presence_penalty: settings.advancedSettings
		// 	? settings.presencePenalty
		// 	: 0.0,
		frequency_penalty,
		messages: [
			...(messages.system.length > 0
				? [
						{
							role: 'system' as const,
							content: messages.system,
						},
					]
				: []),
			{
				role: 'user' as const,
				content: messages.user,
			},
		],
	};

	let headers: Record<string, string> = {
		'Content-Type': 'application/json',
	};

	let path = '/v1/chat/completions';

	switch (settings.aiProvider) {
		case APIProvider.OpenRouter:
			path = `/api${path}`;
			headers = {
				...headers,
				...OpenRouterHeaders,
				Authorization: `Bearer ${providerSettings.apiKey}`,
			};
			break;
		case APIProvider.AzureOpenAI: {
			const providerSettings = settings.aiProviderConfig[settings.aiProvider];
			path = `/openai/deployments/${model}/chat/completions?api-version=${providerSettings.apiVersion}`;
			// Remove model from body
			const { model: _, ...newObj } = body;
			body = newObj;
			break;
		}
		default:
			if (settings.aiProvider === APIProvider.PerplexityAI) {
				path = path.replace('/v1', '');
			}
			headers = {
				...headers,
				Authorization: `Bearer ${providerSettings.apiKey}`,
			};
			break;
	}

	const urlHost = getAPIHost(
		providerSettings.baseUrl,
		DEFAULT_HOST[settings.aiProvider],
	);

	if (!isV1Needed(urlHost)) {
		path = path.replace('/v1', '');
	}

	const url = `${urlHost}${path}`;

	const response = await request({
		url,
		headers,
		method: 'POST',
		body: JSON.stringify(body),
	});

	const { choices }: OpenAI.ChatCompletion = JSON.parse(response);

	return choices[0].message.content;
}
