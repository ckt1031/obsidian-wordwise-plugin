import { APIProvider, DEFAULT_HOST } from '@/config';
import { OpenAIModelsSchema } from '@/schemas/models';
import type { Models, ProviderTextAPIProps } from '@/types';
import { getAPIHost } from '@/utils/get-url-host';
import { createOpenAI } from '@xsai-ext/providers-cloud';
import { type GenerateTextOptions, generateText } from '@xsai/generate-text';
import { type StreamTextOptions, streamText } from '@xsai/stream-text';
// import { smoothStream, toAsyncIterator } from '@xsai/utils-stream';
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
	if (!isTesting) {
		plugin.generationRequestAbortController = new AbortController();
		plugin.updateStatusBar(); // Show status bar loader
	}

	let headers: Record<string, string> = {};

	const host = getAPIHost(
		baseURL,
		plugin.settings.aiProvider in DEFAULT_HOST
			? DEFAULT_HOST[plugin.settings.aiProvider as keyof typeof DEFAULT_HOST]
			: '',
	);

	let suffixPath = '/v1/';

	if (provider === APIProvider.OpenRouter) {
		headers = {
			...headers,
			...OpenRouterHeaders,
		};
		// OpenRouter needs to be https://openrouter.ai/api/v1/
		suffixPath = `/api${suffixPath}`;
	}

	if (
		provider === APIProvider.PerplexityAI ||
		provider === APIProvider.GitHub
	) {
		// Remove /v1 from path
		suffixPath = suffixPath.replace('/v1/', '/');
	}

	// Cohere compatibility
	if (provider === APIProvider.Cohere) {
		// https://example.com/v1/ to https://example.com/compatibility/v1/
		suffixPath = suffixPath.replace('/v1/', '/compatibility/v1/');
	}

	// Google AI Studio compatibility
	if (provider === APIProvider.GoogleGemini) {
		// https://example.com/v1/ to https://example.com/v1beta/openai/
		suffixPath = suffixPath.replace('/v1/', '/v1beta/openai/');
	}

	// FORCE Remove /v1 from path
	if (providerSettings?.omitVersionPrefix && plugin.settings.advancedSettings) {
		suffixPath = suffixPath.replace('/v1/', '/');
	}

	const providerBody = createOpenAI(apiKey, `${host}${suffixPath}`);

	const body: GenerateTextOptions & StreamTextOptions = {
		...providerBody.chat(model),
		headers,
		temperature: plugin.settings.temperature,
		messages: [
			// We will add system message here later if needed
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
		// Allowing interruptible request
		abortSignal: isTesting
			? undefined
			: plugin.generationRequestAbortController?.signal,
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

	try {
		if (props.stream) {
			const { textStream } = await streamText(body);

			// // Make the stream view smoother, some API or models might be streaming in weird ways
			// const smoothTextStream = textStream.pipeThrough(
			// 	smoothStream({
			// 		delay: 15,
			// 		chunking: 'word',
			// 	}),
			// );

			// // https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream#browser_compatibility
			// const iterableStream = toAsyncIterator(smoothTextStream);

			const text: string[] = [];

			for await (const textPart of textStream) {
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
			cause:
				error instanceof Error ? error.cause || error.message : String(error),
		});
	} finally {
		plugin.generationRequestAbortController = null;
		if (!isTesting) plugin.updateStatusBar(); // Clear status bar
	}
}
