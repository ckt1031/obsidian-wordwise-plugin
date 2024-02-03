import type Anthropic from '@anthropic-ai/sdk';
import { request } from 'obsidian';
import { DEFAULT_ANTHROPIC_API_HOST } from '../config';
import { AIProviderProps } from '../types';
import { getAPIHost } from '../utils/get-url-hsot';

export async function handleAnthropicAI({
	settings,
	userMessage,
	customAiModel = '',
}: AIProviderProps) {
	const modelName =
		customAiModel.length > 0 ? customAiModel : settings.anthropicModel;

	const extraPrompt = `
			Please kindly remember no human conversation here, do not give extra comments outside, response only with modified text WITHOUT === WRAPPER, highly thanks.
			`;

	const body: Anthropic.CompletionCreateParamsNonStreaming = {
		prompt: `\n\nHuman: ${userMessage}\n\n${extraPrompt}\n\nAssistant:`,
		model: modelName,
		stream: false,
		max_tokens_to_sample:
			settings.advancedSettings && settings.maxTokens !== 0
				? settings.maxTokens
				: 2048,
		...(settings.advancedSettings && {
			temperature: settings.temperature,
		}),
	};

	const response = await request({
		url: `${getAPIHost(
			settings.anthropicBaseUrl,
			DEFAULT_ANTHROPIC_API_HOST,
		)}/v1/complete`,
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'anthropic-version': '2023-06-01',
			'x-api-key': settings.anthropicApiKey,
		},
		body: JSON.stringify(body),
	});

	const json: Anthropic.Completion = JSON.parse(response);

	return json.completion;
}
