import { requestUrl } from 'obsidian';

import type OpenAI from 'openai';
import { parseAsync } from 'valibot';

import { APIProvider, PROVIDER_DEFAULTS } from '@/config';
import { OpenAIModelsSchema } from '@/schemas/models';
import type { Models, ProviderTextAPIProps } from '@/types';
import { getAPIHost } from '@/utils/get-url-host';
import { streamText } from '@/utils/stream-text';

export type ModelRequestProps = {
	host: string;
	apiKey: string;
	provider: string;
	modelsPath?: string;
};

export async function getOpenAIModels({
	host,
	apiKey,
	provider,
	modelsPath,
}: ModelRequestProps): Promise<Models> {
	const defaultEndpoints = PROVIDER_DEFAULTS[provider as APIProvider];

	const path = modelsPath || defaultEndpoints?.models || '/v1/models';

	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
		Authorization: `Bearer ${apiKey}`,
	};

	const response = await requestUrl({
		url: `${host}${path}`,
		headers,
	});

	if (response.status !== 200) {
		throw new Error(response.text);
	}

	const models = await parseAsync(OpenAIModelsSchema, response.json);

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
	model,
	provider,
	messages,
	plugin,
	providerSettings,
	isTesting = false,
	...props
}: ProviderTextAPIProps) {
	if (!isTesting) {
		plugin.generationRequestAbortController = new AbortController();
		plugin.updateStatusBar(); // Show status bar loader
	}

	const { apiKey, baseUrl } = providerSettings;

	let headers: Record<string, string> = {
		'Content-Type': 'application/json',
		Authorization: `Bearer ${apiKey}`,
	};

	const host = getAPIHost(
		baseUrl,
		PROVIDER_DEFAULTS[plugin.settings.aiProvider as APIProvider]?.host || '',
	);

	const defaultEndpoints = PROVIDER_DEFAULTS[provider as APIProvider];

	const path =
		(plugin.settings.advancedSettings
			? providerSettings.chatPath
			: undefined) ||
		defaultEndpoints?.chat ||
		'/v1/chat/completions';

	if (provider === APIProvider.OpenRouter) {
		const OpenRouterHeaders = {
			'HTTP-Referer': 'https://github.com/ckt1031/obsidian-wordwise-plugin',
			'X-Title': 'Obsidian Wordwise Plugin',
		};

		headers = {
			...headers,
			...OpenRouterHeaders,
		};
	}

	const body: OpenAI.ChatCompletionCreateParamsNonStreaming = {
		model,
		temperature: providerSettings.temperature || 0.6,
		messages: [
			// We will add system message here later if needed
			{
				role: 'user',
				content: messages.user.trim(),
			},
		],
		// Advanced settings here:
		...(plugin.settings.advancedSettings && {
			...(providerSettings.maxTokens &&
				providerSettings.maxTokens > 0 && {
					max_tokens: providerSettings.maxTokens,
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

	const url = `${host}${path}`;

	try {
		const response = await fetch(url, {
			headers,
			method: 'POST',
			body: JSON.stringify({ ...body, stream: props.stream }),
			// Allowing interruptible request
			signal: isTesting
				? undefined
				: plugin.generationRequestAbortController?.signal,
		});

		if (!response.body) {
			throw new Error('Response body is not readable.');
		}

		if (!response.ok || response.status !== 200) {
			throw new Error(await response.text());
		}

		if (props.stream) {
			const { textStream } = await streamText(response.body);

			const text: string[] = [];

			for await (const textPart of textStream) {
				text.push(textPart);
				props.onStreamText?.(textPart);
			}

			props.onStreamComplete?.();

			return text.join('');
		}

		const resData: OpenAI.ChatCompletion = await response.json();

		return resData.choices[0].message.content;
	} catch (error) {
		throw new Error('Request failed', {
			cause:
				error instanceof Error ? error.cause || error.message : String(error),
		});
	} finally {
		plugin.generationRequestAbortController = null;
		if (!isTesting) plugin.updateStatusBar(); // Clear status bar
	}
}
