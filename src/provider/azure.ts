import { APIProvider } from '@/config';
import { type AIProviderProps } from '@/types';
import { Notice, request } from 'obsidian';
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

	// Validate the API Version YYYY-MM-DD
	if (!/\d{4}-\d{2}-\d{2}/.test(providerSettings.apiVersion)) {
		new Notice('Invalid API Version, please enter in YYYY-MM-DD format');
		return;
	}

	const url = `${providerSettings.baseUrl}/openai/deployments/${modelName}/chat/completions?api-version=${providerSettings.apiVersion}`;

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
