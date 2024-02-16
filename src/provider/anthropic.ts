import { DEFAULT_ANTHROPIC_API_HOST } from '@/config';
import type { AIProviderProps } from '@/types';
import { getAPIHost } from '@/utils/get-url-hsot';
import type {
	Message,
	MessageCreateParams,
} from '@anthropic-ai/sdk/resources/beta/messages';
import { request } from 'obsidian';

export async function handleTextAnthropicAI({
	plugin,
	userMessage,
	customAiModel = '',
}: AIProviderProps) {
	const { settings } = plugin;

	const providerSettings = settings.aiProviderConfig[settings.aiProvider];

	const modelName =
		customAiModel.length > 0 ? customAiModel : providerSettings.model;

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
		providerSettings.baseUrl,
		DEFAULT_ANTHROPIC_API_HOST,
	)}/v1/messages`;

	const response = await request({
		url,
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'anthropic-version': '2023-06-01',
			'anthropic-beta': 'messages-2023-12-15',
			'x-api-key': providerSettings.apiKey,
		},
		body: JSON.stringify(body),
	});

	const json: Message = JSON.parse(response);

	return json.content[0].text;
}
