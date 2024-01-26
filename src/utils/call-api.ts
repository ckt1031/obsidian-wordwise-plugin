import type Anthropic from '@anthropic-ai/sdk';
import type {
	GenerateContentRequest,
	GenerateContentResponse,
} from '@google/generative-ai';
import { request } from 'obsidian';
import type OpenAI from 'openai';
import {
	DEFAULT_ANTHROPIC_API_HOST,
	DEFAULT_GOOGLE_AI_API_HOST,
	DEFAULT_OPENAI_API_HOST,
} from '../config';
import { APIProvider, type CallAPIProps } from '../types';
// import { checkAPIKey } from './check-api-key';
import { log } from './logging';

export function getAPIHost(url: string, defaultHost: string): string {
	const urlPrefix = url.startsWith('http') ? '' : 'http://';
	const host = url.length > 0 ? url : defaultHost;

	return `${urlPrefix}${host}`;
}

export async function callGoogleAIAPI({
	userMessages,
	settings,
}: CallAPIProps) {
	let callModel = settings.googleAIModel;

	if (settings.customAiModel.length > 0 && settings.advancedSettings) {
		callModel = settings.customAiModel;
	}

	const url = `${getAPIHost(
		settings.googleAIBaseUrl,
		DEFAULT_GOOGLE_AI_API_HOST,
	)}/v1beta/models/${callModel}:generateContent?key=${settings.googleAIApiKey}`;

	const body: GenerateContentRequest = {
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
	};

	log(
		settings,
		`Sending request to ${url} (${callModel}, Temp: ${settings.temperature}) with prompt:\n\n${userMessages}`,
	);

	const response = await request({
		url,
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(body),
	});

	const json: GenerateContentResponse = JSON.parse(response);

	log(settings, `Received response: ${JSON.stringify(json)}`);

	if (!json.candidates || json.candidates.length === 0) {
		return null;
	}

	return json.candidates[0].content.parts[0].text;
}

export async function callAnthropicAPI({
	userMessages,
	settings,
}: CallAPIProps) {
	let callModel = settings.anthropicModel;
	const url = `${getAPIHost(
		settings.anthropicBaseUrl,
		DEFAULT_ANTHROPIC_API_HOST,
	)}/v1/complete`;

	if (settings.customAiModel.length > 0 && settings.advancedSettings) {
		callModel = settings.customAiModel;
	}

	const body: Anthropic.CompletionCreateParamsNonStreaming = {
		prompt: `\n\nHuman: ${userMessages}\n\nAssistant:`,
		model: callModel,
		stream: false,
		max_tokens_to_sample:
			settings.advancedSettings && settings.maxTokens !== 0
				? settings.maxTokens
				: 2048,
		...(settings.advancedSettings && {
			temperature: settings.temperature,
		}),
	};

	log(
		settings,
		`Sending request to ${url} (${callModel}, Temp: ${settings.temperature}) with prompt:\n\n${userMessages}`,
	);

	const response = await request({
		url,
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'anthropic-version': '2023-06-01',
			'x-api-key': settings.anthropicApiKey,
		},
		body: JSON.stringify(body),
	});

	const json: Anthropic.Completion = JSON.parse(response);

	log(settings, `Received response: ${JSON.stringify(json)}`);

	return json.completion;
}

export async function callOpenAIAPI({ userMessages, settings }: CallAPIProps) {
	const url = `${getAPIHost(
		settings.openAiBaseUrl,
		DEFAULT_OPENAI_API_HOST,
	)}/v1/chat/completions`;

	let callModel = settings.openAiModel;

	if (settings.customAiModel.length > 0 && settings.advancedSettings) {
		callModel = settings.customAiModel;
	}

	const body: OpenAI.ChatCompletionCreateParams = {
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
	};

	log(
		settings,
		`Sending request to ${url} (${callModel}, Temp: ${settings.temperature}) with prompt:\n\n${userMessages}`,
	);

	const response = await request({
		url,
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${settings.openAiApiKey}`,
		},
		body: JSON.stringify(body),
	});

	const json: OpenAI.ChatCompletion = JSON.parse(response);

	log(settings, `Received response: ${JSON.stringify(json)}`);

	return json.choices[0].message.content;
}

export async function callAPI({
	settings,
	userMessages,
}: CallAPIProps): Promise<string | null | undefined> {
	// checkAPIKey(settings);
	const apiProvider = settings.apiProvider;

	switch (apiProvider) {
		case APIProvider.OpenAI:
			return await callOpenAIAPI({
				settings,
				userMessages,
			});
		case APIProvider.Anthropic:
			return await callAnthropicAPI({
				settings,
				userMessages,
			});
		case APIProvider.GoogleGemini:
			return await callGoogleAIAPI({
				settings,
				userMessages,
			});
		default:
			throw new Error(`Unknown API Provider: ${apiProvider}`);
	}
}
