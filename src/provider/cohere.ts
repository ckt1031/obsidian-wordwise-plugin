import { DEFAULT_HOST } from '@/config';
import type { AIProviderProps } from '@/types';
import { getAPIHost } from '@/utils/get-url-host';
import { convertKeysToSnakeCase } from '@/utils/keys-to-snakecase';
import type { GenerateRequest, Generation } from 'cohere-ai/api';
import { request } from 'obsidian';

export async function handleTextCohere({
	plugin,
	userMessage,
	customAiModel = '',
}: AIProviderProps) {
	const { settings } = plugin;

	const providerSettings = settings.aiProviderConfig[settings.aiProvider];

	const modelName =
		customAiModel.length > 0 ? customAiModel : providerSettings.model;

	const body: GenerateRequest = {
		prompt: userMessage,
		model: modelName,
		numGenerations: 1,
		temperature: settings.advancedSettings ? settings.temperature : 0.5,
		maxTokens: settings.advancedSettings ? settings.maxTokens : 2000,
	};

	const url = `${getAPIHost(
		providerSettings.baseUrl,
		DEFAULT_HOST[settings.aiProvider],
	)}/v1/generate`;

	const response = await request({
		url,
		method: 'POST',
		headers: {
			accept: 'application/json',
			'Content-Type': 'application/json',
			Authorization: `Bearer ${providerSettings.apiKey}`,
		},
		body: JSON.stringify(
			convertKeysToSnakeCase(body as unknown as Record<string, unknown>),
		),
	});

	const { generations }: Generation = JSON.parse(response);

	return generations[0].text;
}
