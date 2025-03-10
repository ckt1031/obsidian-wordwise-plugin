import { APIProvider } from '@/config';
import { OpenAIModelsSchema } from '@/schemas/models';
import type { Models, PluginSettings, ProviderTextAPIProps } from '@/types';
import { Notice, request, requestUrl } from 'obsidian';
import type OpenAI from 'openai';
import { parseAsync } from 'valibot';

const OpenRouterHeaders = {
	'HTTP-Referer': 'https://github.com/ckt1031/obsidian-wordwise-plugin',
	'X-Title': 'Obsidian Wordwise Plugin',
};

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
	let path = '/v1/models';

	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
		Authorization: `Bearer ${apiKey}`,
	};

	if (provider === APIProvider.OpenRouter) {
		path = `/api${path}`;
	}

	const response = await request({
		url: `${host}${path}`,
		headers,
	});

	const models = await parseAsync(OpenAIModelsSchema, JSON.parse(response));

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

export async function handleTextOpenAI({
	host,
	model,
	provider,
	messages,
	apiKey,
	allSettings,
	providerSettings,
}: ProviderTextAPIProps) {
	if (provider === APIProvider.AzureOpenAI) {
		// Reject if base URL is not set
		if (!providerSettings.baseUrl || providerSettings.baseUrl.length === 0) {
			throw new Error('Base URL is not set');
		}

		// Validate the API Version YYYY-MM-DD
		if (
			providerSettings.apiVersion &&
			!/\d{4}-\d{2}-\d{2}/.test(providerSettings.apiVersion)
		) {
			new Notice('Invalid API Version, please enter in YYYY-MM-DD format');
			return;
		}
	}

	let body:
		| OpenAI.ChatCompletionCreateParams
		| Omit<OpenAI.ChatCompletionCreateParams, 'model'> = {
		stream: false,
		model,
		temperature: allSettings.temperature,

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

		// Advanced settings here:
		...(allSettings.advancedSettings && {
			...(allSettings.maxTokens > 0 && {
				max_tokens: allSettings.maxTokens,
			}),
		}),
	};

	let headers: Record<string, string> = {
		'Content-Type': 'application/json',
	};

	let path = '/v1/chat/completions';

	switch (provider) {
		case APIProvider.OpenRouter:
			path = `/api${path}`;
			headers = {
				...headers,
				...OpenRouterHeaders,
				Authorization: `Bearer ${apiKey}`,
			};
			break;
		case APIProvider.AzureOpenAI: {
			path = `/openai/deployments/${model}/chat/completions?api-version=${(providerSettings as PluginSettings['aiProviderConfig'][APIProvider.AzureOpenAI]).apiVersion}`;
			// Remove model from body
			const { model: _, ...newObj } = body;
			body = newObj;
			headers = {
				...headers,
				'api-key': providerSettings.apiKey,
			};
			break;
		}
		default:
			if (provider === APIProvider.PerplexityAI) {
				path = path.replace('/v1', '');
			}
			if (provider === APIProvider.Cohere) {
				path = path.replace('/v1', '/compatibility/v1');
			}
			if (provider === APIProvider.GoogleGemini) {
				path = path.replace('/v1', '/v1beta/openai');
			}
			headers = {
				...headers,
				Authorization: `Bearer ${apiKey}`,
			};
			break;
	}

	if (providerSettings?.doNotAppendV1ToPath && allSettings.advancedSettings) {
		path = path.replace('/v1', '');
	}

	const url = `${host}${path}`;

	const response = await requestUrl({
		url,
		headers,
		method: 'POST',
		body: JSON.stringify(body),
	});

	if (response.status !== 200) {
		throw new Error(response.text);
	}

	const { choices }: OpenAI.ChatCompletion = JSON.parse(response.text);

	return choices[0].message.content;
}
