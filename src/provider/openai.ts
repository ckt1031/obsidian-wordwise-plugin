import { requestUrl } from 'obsidian';

import { createOpenAI } from '@ai-sdk/openai';
import { generateText, streamText } from 'ai';
import { parseAsync } from 'valibot';

import { APIProvider, PROVIDER_DEFAULTS } from '@/config';
import { OpenAIModelsSchema } from '@/schemas/models';
import type { Models, ProviderTextAPIProps } from '@/types';
import { getAPIHost } from '@/utils/get-url-host';

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
	const defaultEndpoints = PROVIDER_DEFAULTS[provider as APIProvider];

	const path = defaultEndpoints?.models || '/models';

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
		Authorization: `Bearer ${apiKey}`,
	};

	let host = getAPIHost(
		baseUrl,
		PROVIDER_DEFAULTS[plugin.settings.aiProvider as APIProvider]?.host || '',
	);

	const isCustom = providerSettings.isCustom;

	if (isCustom) {
		host = `${host}${providerSettings.chatPath || '/v1'}`;
	} else {
		host = `${host}${provider === APIProvider.OpenRouter ? '/api/v1' : '/v1'}`;
	}

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

	const openai = createOpenAI({
		apiKey,
		baseURL: host,
		headers,
	});

	const bodyMessages: (
		| { role: 'system'; content: string }
		| { role: 'user'; content: string }
		| { role: 'assistant'; content: string }
	)[] = [];

	if (messages.system.length > 0) {
		if (
			plugin.settings.disableSystemInstructions &&
			plugin.settings.advancedSettings
		) {
			// Add system message to user message
			bodyMessages.push({
				role: 'user',
				content: `${messages.system.trim()}\n\n${messages.user.trim()}`,
			});
		} else {
			bodyMessages.push({
				role: 'system',
				content: messages.system.trim(),
			});
			bodyMessages.push({
				role: 'user',
				content: messages.user.trim(),
			});
		}
	} else {
		bodyMessages.push({
			role: 'user',
			content: messages.user.trim(),
		});
	}

	try {
		const commonProps = {
			model: openai.chat(model),
			messages: bodyMessages,
			temperature: providerSettings.temperature || 0.6,
			abortSignal: isTesting
				? undefined
				: plugin.generationRequestAbortController?.signal,
			...(plugin.settings.advancedSettings && {
				maxTokens:
					providerSettings.maxTokens && providerSettings.maxTokens > 0
						? providerSettings.maxTokens
						: undefined,
			}),
		};

		if (props.stream) {
			const { textStream } = streamText(commonProps);

			let fullText = '';
			for await (const textPart of textStream) {
				fullText += textPart;
				props.onStreamText?.(textPart);
			}

			props.onStreamComplete?.();
			return fullText;
		}

		const { text } = await generateText(commonProps);
		return text;
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
