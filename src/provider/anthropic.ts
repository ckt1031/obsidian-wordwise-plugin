import { requestUrl } from 'obsidian';

import { createAnthropic } from '@ai-sdk/anthropic';
import { generateText, streamText } from 'ai';
import { parseAsync } from 'valibot';

import { APIProvider, PROVIDER_DEFAULTS } from '@/config';
import { AnthropicModelsSchema } from '@/schemas/models';
import type { Models, ProviderTextAPIProps } from '@/types';
import { getAPIHost } from '@/utils/get-url-host';
import type { ModelRequestProps } from './openai';

export async function getAnthropicModels({
	host,
	apiKey,
}: ModelRequestProps): Promise<Models> {
	const path = PROVIDER_DEFAULTS[APIProvider.Anthropic].models;
	const url = `${host}${path}`;

	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
		'anthropic-version': '2023-06-01',
		'x-api-key': apiKey,
	};

	const response = await requestUrl({
		url: url,
		headers: headers,
	});

	if (response.status !== 200) {
		throw new Error(response.text);
	}

	const data = await parseAsync(AnthropicModelsSchema, response.json);

	const list: Models = [];

	for (const model of data.models) {
		list.push({
			id: model.id,
			name: model.displayName,
		});
	}

	return list;
}

export async function handleTextAnthropic({
	model,
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

	let host = getAPIHost(baseUrl, PROVIDER_DEFAULTS[APIProvider.Anthropic].host);

	host = `${host}/v1`;

	const anthropic = createAnthropic({
		apiKey,
		baseURL: host,
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
			model: anthropic(model),
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
