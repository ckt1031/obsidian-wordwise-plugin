import { APIProvider, type AIProviderProps } from '@/types';
import { request } from 'obsidian';
import type {
	ChatCompletion,
	ChatCompletionCreateParams,
} from 'openai/resources/chat/completions';

export async function handleTextAzureOpenAI({
	plugin,
	userMessage,
	customAiModel = '',
}: AIProviderProps) {
	const { settings } = plugin;

	if (settings.aiProvider !== APIProvider.AzureOpenAI) {
		throw new Error('Invalid provider');
	}

	const providerSettings = settings.aiProviderConfig[settings.aiProvider];

	const modelName =
		customAiModel.length > 0 ? customAiModel : providerSettings.model;

	// Reject if base URL is not set
	if (!providerSettings.baseUrl || providerSettings.baseUrl.length === 0) {
		throw new Error('Base URL is not set');
	}

	const url = `${providerSettings.baseUrl}/openai/deployments/${providerSettings.model}/chat/completions?api-version=${providerSettings.apiVersion}`;

	const body: Omit<ChatCompletionCreateParams, 'model'> = {
		stream: false,
		temperature: settings.advancedSettings ? settings.temperature : 0.5,
		max_tokens: settings.advancedSettings ? settings.maxTokens : 2000,
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

	const response = await request({
		url,
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'api-key': providerSettings.apiKey,
		},
		body: JSON.stringify(body),
	});

	const { choices }: ChatCompletion = JSON.parse(response);

	return choices[0].message.content;
}
