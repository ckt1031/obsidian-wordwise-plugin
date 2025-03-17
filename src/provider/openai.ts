import { APIProvider } from '@/config';
import { OpenAIModelsSchema } from '@/schemas/models';
import type { Models, PluginSettings, ProviderTextAPIProps } from '@/types';
import { Notice, request } from 'obsidian';
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
	baseURL,
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
			throw new Error('Azure base URL is not set');
		}

		// Validate the API Version YYYY-MM-DD
		if (
			providerSettings.apiVersion &&
			!/\d{4}-\d{2}-\d{2}/.test(providerSettings.apiVersion)
		) {
			new Notice(
				'Invalid Azure API Version, please enter in YYYY-MM-DD format',
			);
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
			// {
			// 	role: 'system',
			// 	content: messages.system,
			// },
			{
				role: 'user',
				content: messages.user.trim(),
			},
		],

		// Advanced settings here:
		...(allSettings.advancedSettings && {
			...(allSettings.maxTokens > 0 && {
				max_tokens: allSettings.maxTokens,
			}),
		}),
	};

	if (messages.system.length > 0) {
		if (allSettings.disableSystemInstructions && allSettings.advancedSettings) {
			// Add system message to user message
			body.messages[0].content = `${messages.system.trim()}\n\n${body.messages[0].content}`;
		} else {
			// Add system message to the beginning
			body.messages.unshift({
				role: 'system',
				content: messages.system.trim(),
			});
		}
	}

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
			// Case 1: Remove /v1 from path
			if (
				provider === APIProvider.PerplexityAI ||
				provider === APIProvider.GitHub
			) {
				path = path.replace('/v1', '');
			}

			// Cohere compatibility
			if (provider === APIProvider.Cohere) {
				path = path.replace('/v1', '/compatibility/v1');
			}

			// Google AI Studio compatibility
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

	const url = `${baseURL}${path}`;

	const response = await fetch(url, {
		headers,
		method: 'POST',
		body: JSON.stringify(body),
	});

	if (response.status !== 200) {
		throw new Error(response.status.toString(), {
			cause: await response.text(),
		});
	}

	const resData: OpenAI.ChatCompletion = await response.json();

	// Check if it has choices and return the first one
	if (!resData.choices || resData.choices.length === 0) {
		throw new Error('Request failed', {
			cause: JSON.stringify(resData),
		});
	}

	return resData.choices[0].message.content;
}
