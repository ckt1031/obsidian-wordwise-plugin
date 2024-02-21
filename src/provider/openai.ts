import { APIProvider, DEFAULT_HOST } from '@/config';
import { type AIProviderProps, OpenAIModelsSchema } from '@/types';
import { getAPIHost } from '@/utils/get-url-host';
import { Notice, request } from 'obsidian';
import type {
	ChatCompletion,
	ChatCompletionCreateParams,
} from 'openai/resources/chat/completions';
import { parseAsync } from 'valibot';

const OpenRouterHeaders = {
	'HTTP-Referer': 'https://github.com/ckt1031/obsidian-wordwise-plugin',
	'X-Title': 'Obsidian Wordwise Plugin',
};

export async function getOpenAIModels({
	plugin,
}: Pick<AIProviderProps, 'plugin'>) {
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

	const models = JSON.parse(response);

	return (await parseAsync(OpenAIModelsSchema, models)).data;
}

export async function handleTextOpenAI({
	plugin,
	userMessage,
	customAiModel = '',
}: AIProviderProps) {
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

	const modelName =
		customAiModel.length > 0 ? customAiModel : providerSettings.model;

	let body:
		| ChatCompletionCreateParams
		| Omit<ChatCompletionCreateParams, 'model'> = {
		stream: false,
		model: modelName,
		temperature: settings.advancedSettings ? settings.temperature : 0.5,
		max_tokens: settings.advancedSettings ? settings.maxTokens : 2000,
		// presence_penalty: settings.advancedSettings
		// 	? settings.presencePenalty
		// 	: 0.0,
		frequency_penalty: settings.advancedSettings
			? settings.frequencyPenalty
			: 0.0,
		messages: [
			{
				role: 'user',
				content: userMessage,
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
			path = `/openai/deployments/${modelName}/chat/completions?api-version=${providerSettings.apiVersion}`;
			// Remove model from body
			const { model: _, ...newObj } = body;
			body = newObj;
			break;
		}
		default:
			headers = {
				...headers,
				Authorization: `Bearer ${providerSettings.apiKey}`,
			};
			break;
	}

	const host = getAPIHost(
		providerSettings.baseUrl,
		DEFAULT_HOST[settings.aiProvider],
	);
	const url = `${host}${path}`;

	const response = await request({
		url,
		headers,
		method: 'POST',
		body: JSON.stringify(body),
	});

	const { choices }: ChatCompletion = JSON.parse(response);

	return choices[0].message.content;
}
