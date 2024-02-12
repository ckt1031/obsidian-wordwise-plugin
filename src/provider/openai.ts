import { DEFAULT_OPENAI_API_HOST } from '@/config';
import type { AIProviderProps } from '@/types';
import { getAPIHost } from '@/utils/get-url-hsot';
import { request } from 'obsidian';
import type {
	ChatCompletion,
	ChatCompletionCreateParams,
} from 'openai/resources/chat/completions';

export async function handleTextOpenAI({
	settings,
	userMessage,
	customAiModel = '',
}: AIProviderProps) {
	const providerSettings = settings.aiProviderConfig[settings.aiProvider];

	const modelName =
		customAiModel.length > 0 ? customAiModel : providerSettings.model;

	const body: ChatCompletionCreateParams = {
		stream: false,
		model: modelName,
		temperature: settings.advancedSettings ? settings.temperature : 0.5,
		max_tokens: settings.advancedSettings ? settings.maxTokens : 2000,
		presence_penalty: settings.advancedSettings
			? settings.presencePenalty
			: 0.0,
		frequency_penalty: settings.advancedSettings
			? settings.frequencyPenalty
			: 0.0,
		messages: [
			{
				role: 'user',
				content: userMessage,
			},
		],
	};

	const url = `${getAPIHost(
		providerSettings.baseUrl,
		DEFAULT_OPENAI_API_HOST,
	)}/v1/chat/completions`;

	const response = await request({
		url,
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${providerSettings.apiKey}`,
		},
		body: JSON.stringify(body),
	});

	const { choices }: ChatCompletion = JSON.parse(response);

	return choices[0].message.content;
}
