import type Anthropic from '@anthropic-ai/sdk';
import type {
	GenerateContentRequest,
	GenerateContentResponse,
} from '@google/generative-ai';
import { RequestUrlParam, request } from 'obsidian';
import type OpenAI from 'openai';
import {
	DEFAULT_ANTHROPIC_API_HOST,
	DEFAULT_GOOGLE_AI_API_HOST,
	DEFAULT_OPENAI_API_HOST,
} from '../config';
import { APIProvider, type CallAPIProps } from '../types';
import { log } from './logging';

export function getAPIHost(url: string, defaultHost: string): string {
	const urlPrefix = url.startsWith('http') ? '' : 'http://';
	const host = url.length > 0 ? url : defaultHost;

	return `${urlPrefix}${host}`;
}

// T and U are the types of the request and response, respectively
// Return a function to handle the final json body
async function handleRequest<T, U>({
	url,
	callModel,
	body,
	settings,
	headers = {
		'Content-Type': 'application/json',
	},
}: {
	url: string;
	callModel: string;
	body: T;
	settings: CallAPIProps['settings'];
	headers?: RequestUrlParam['headers'];
}): Promise<U> {
	log(
		settings,
		`Sending request to ${url} (${callModel}) with body:\n\n${JSON.stringify(
			body,
		)}`,
	);

	const response = await request({
		url,
		method: 'POST',
		headers,
		body: JSON.stringify(body),
	});

	const json: U = JSON.parse(response);

	log(settings, `Received response: ${JSON.stringify(json)}`);

	return json;
}

export async function callAPI({
	settings,
	userMessages,
}: CallAPIProps): Promise<string | null | undefined> {
	const apiProvider = settings.apiProvider;

	let customAiModel = '';

	if (settings.customAiModel.length > 0 && settings.advancedSettings) {
		customAiModel = settings.customAiModel;
	}

	switch (apiProvider) {
		case APIProvider.OpenAI: {
			const callModel =
				customAiModel.length > 0 ? customAiModel : settings.openAiModel;

			return handleRequest<
				OpenAI.ChatCompletionCreateParams,
				OpenAI.ChatCompletion
			>({
				url: `${getAPIHost(
					settings.openAiBaseUrl,
					DEFAULT_OPENAI_API_HOST,
				)}/v1/chat/completions`,
				callModel,
				body: {
					stream: false,
					model: callModel,
					...(settings.advancedSettings && {
						temperature: settings.temperature,
						...(settings.maxTokens !== 0 && {
							max_tokens: settings.maxTokens,
						}),
						presence_penalty: settings.presencePenalty,
						frequency_penalty: settings.frequencyPenalty,
					}),
					messages: [
						{
							role: 'user',
							content: userMessages,
						},
					],
				},
				settings,
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${settings.openAiApiKey}`,
				},
			}).then(({ choices }) => choices[0].message.content);
		}
		case APIProvider.Anthropic: {
			const callModel =
				customAiModel.length > 0 ? customAiModel : settings.anthropicModel;

			const extraPrompt = `
			Please kindly remember no human conversation here, do not give extra comments outside, response only with modified text WITHOUT === WRAPPER, highly thanks.
			`;

			return handleRequest<
				Anthropic.CompletionCreateParamsNonStreaming,
				Anthropic.Completion
			>({
				url: `${getAPIHost(
					settings.anthropicBaseUrl,
					DEFAULT_ANTHROPIC_API_HOST,
				)}/v1/complete`,
				callModel,
				body: {
					prompt: `\n\nHuman: ${userMessages}\n\n${extraPrompt}\n\nAssistant:`,
					model: callModel,
					stream: false,
					max_tokens_to_sample:
						settings.advancedSettings && settings.maxTokens !== 0
							? settings.maxTokens
							: 2048,
					...(settings.advancedSettings && {
						temperature: settings.temperature,
					}),
				},
				settings,
				headers: {
					'Content-Type': 'application/json',
					'anthropic-version': '2023-06-01',
					'x-api-key': settings.anthropicApiKey,
				},
			}).then(({ completion }) => completion);
		}
		case APIProvider.GoogleGemini: {
			const callModel =
				customAiModel.length > 0 ? customAiModel : settings.googleAIBaseUrl;

			return handleRequest<GenerateContentRequest, GenerateContentResponse>({
				url: `${getAPIHost(
					settings.googleAIBaseUrl,
					DEFAULT_GOOGLE_AI_API_HOST,
				)}/v1beta/models/${callModel}:generateContent?key=${
					settings.googleAIApiKey
				}`,
				callModel,
				body: {
					contents: [
						{
							role: 'user',
							parts: [
								{
									text: userMessages,
								},
							],
						},
					],
					...(settings.advancedSettings && {
						generationConfig: {
							temperature: settings.temperature,
							maxOutputTokens: settings.maxTokens,
						},
					}),
				},
				settings,
			}).then(({ candidates }) => {
				if (!candidates || candidates.length === 0) {
					return null;
				}

				return candidates[0].content.parts[0].text;
			});
		}
		default:
			throw new Error(`Unknown API Provider: ${apiProvider}`);
	}
}
