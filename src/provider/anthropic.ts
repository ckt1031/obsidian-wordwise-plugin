import type {
	Message,
	MessageCreateParams,
} from '@anthropic-ai/sdk/resources/beta/messages';
import { request } from 'obsidian';
import { DEFAULT_ANTHROPIC_API_HOST } from '../config';
import { AIProviderProps } from '../types';
import { getAPIHost } from '../utils/get-url-hsot';

export async function handleTextAnthropicAI({
	settings,
	userMessage,
	customAiModel = '',
}: AIProviderProps) {
	const modelName =
		customAiModel.length > 0 ? customAiModel : settings.anthropicModel;

	const extraPrompt = `
			Please kindly remember no human conversation here, do not give extra comments outside, response only with modified text WITHOUT === WRAPPER, highly thanks.
			`;

	const body: MessageCreateParams = {
		messages: [{ role: 'user', content: `${extraPrompt}\n\n${userMessage}` }],
		model: modelName,
		stream: false,
		max_tokens:
			settings.advancedSettings && settings.maxTokens !== 0
				? settings.maxTokens
				: 2048,
		temperature: settings.advancedSettings ? settings.temperature : 0.5,
	};

	const url = `${getAPIHost(
		settings.anthropicBaseUrl,
		DEFAULT_ANTHROPIC_API_HOST,
	)}/v1/messages`;

	const response = await request({
		url,
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'anthropic-version': '2023-06-01',
			'anthropic-beta': 'messages-2023-12-15',
			'x-api-key': settings.anthropicApiKey,
		},
		body: JSON.stringify(body),
	});

	const json: Message = JSON.parse(response);

	return json.content[0].text;
}
