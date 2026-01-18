import { requestUrl } from 'obsidian';

import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText, streamText } from 'ai';
import { parseAsync } from 'valibot';

import { APIProvider, PROVIDER_DEFAULTS } from '@/config';
import { GoogleGenAIModelsSchema } from '@/schemas/models';
import type { Models, ProviderTextAPIProps } from '@/types';
import { getAPIHost } from '@/utils/get-url-host';
import type { ModelRequestProps } from './openai';

export async function getGoogleGenAIModels({
	host,
	apiKey,
}: ModelRequestProps): Promise<Models> {
	const path = PROVIDER_DEFAULTS[APIProvider.GoogleGemini].models;
	const url = `${host}${path}?key=${apiKey}`;

	const response = await requestUrl(url);

	if (response.status !== 200) {
		throw new Error(response.text);
	}

	const data = await parseAsync(GoogleGenAIModelsSchema, response.json);

	const list: Models = [];

	for (const model of data.models) {
		if (model.supportedGenerationMethods.includes('generateContent')) {
			list.push({
				id: model.name.replace('models/', ''),
				name: model.displayName,
			});
		}
	}

	return list;
}

export async function handleTextGoogle({
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

	let host = getAPIHost(
		baseUrl,
		PROVIDER_DEFAULTS[APIProvider.GoogleGemini].host,
	);

	host = `${host}/v1beta`;

	const google = createGoogleGenerativeAI({
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
			model: google(model),
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
