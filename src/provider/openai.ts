import { APIProvider, DEFAULT_HOST } from '@/config';
import { OpenAIModelsSchema } from '@/schemas/models';
import type { Models, PluginSettings, ProviderTextAPIProps } from '@/types';
import { getAPIHost } from '@/utils/get-url-host';
import { type GenerateTextOptions, generateText } from '@xsai/generate-text';
import { type StreamTextOptions, streamText } from '@xsai/stream-text';
import { smoothStream, toAsyncIterator } from '@xsai/utils-stream';
import { Notice } from 'obsidian';
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

	const response = await fetch(`${host}${path}`, {
		headers,
	});

	if (response.status !== 200) {
		throw new Error(await response.text());
	}

	const models = await parseAsync(OpenAIModelsSchema, await response.json());

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
	plugin,
	providerSettings,
	isTesting = false,
	...props
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

	if (!isTesting) {
		plugin.generationRequestAbortController = new AbortController();
		plugin.updateStatusBar(); // Show status bar loader
	}

	const body: GenerateTextOptions & StreamTextOptions = {
		// Base URL for the API
		baseURL: '', // WILL BE SET LATER

		model,
		temperature: plugin.settings.temperature,

		abortSignal: isTesting
			? undefined
			: plugin.generationRequestAbortController?.signal,

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
		...(plugin.settings.advancedSettings && {
			...(plugin.settings.maxTokens > 0 && {
				max_tokens: plugin.settings.maxTokens,
			}),
		}),
	};

	if (messages.system.length > 0) {
		if (
			plugin.settings.disableSystemInstructions &&
			plugin.settings.advancedSettings
		) {
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

	let headers: Record<string, string> = {};

	let path = '/v1/';

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
			// // Remove model from body
			// const { model: _, ...newObj } = body;
			// body = newObj;
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

	if (providerSettings?.omitVersionPrefix && plugin.settings.advancedSettings) {
		path = path.replace('/v1', '');
	}

	const host = getAPIHost(
		baseURL,
		plugin.settings.aiProvider in DEFAULT_HOST
			? DEFAULT_HOST[plugin.settings.aiProvider as keyof typeof DEFAULT_HOST]
			: '',
	);

	// Set the base URL and headers for the request
	body.baseURL = `${host}${path}`;
	body.headers = headers;

	try {
		if (props.stream) {
			const { textStream } = await streamText(body);

			// Make the stream view smoother, some API or models might be streaming in weird ways
			const smoothTextStream = textStream.pipeThrough(
				smoothStream({
					delay: 15,
					chunking: 'word',
				}),
			);

			// https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream#browser_compatibility
			const iterableStream = toAsyncIterator(smoothTextStream);

			const text: string[] = [];

			for await (const textPart of iterableStream) {
				text.push(textPart);
				props.onStreamText?.(textPart);
			}

			props.onStreamComplete?.();

			return text.join('');
		}

		const { text } = await generateText(body);

		return text;
	} catch (error) {
		throw new Error('Request failed', {
			cause: error instanceof Error ? error.message : String(error),
		});
	} finally {
		plugin.generationRequestAbortController = null;
		if (!isTesting) plugin.updateStatusBar(); // Clear status bar
	}
}
