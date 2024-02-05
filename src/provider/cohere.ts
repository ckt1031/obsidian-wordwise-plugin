import { DEFAULT_COHERE_AI_API_HOST } from '@/config';
import { AIProviderProps } from '@/types';
import { getAPIHost } from '@/utils/get-url-hsot';
import { convertKeysToSnakeCase } from '@/utils/keys-to-snakecase';
import type { GenerateRequest, SingleGeneration } from 'cohere-ai/api';
import { request } from 'obsidian';

export async function handleTextCohere({
	settings,
	userMessage,
	customAiModel = '',
}: AIProviderProps) {
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
		DEFAULT_COHERE_AI_API_HOST,
	)}/v1/generate`;

	const response = await request({
		url,
		method: 'POST',
		headers: {
			accept: 'application/json',
			'Content-Type': 'application/json',
			Authorization: `Bearer ${providerSettings.apiKey}`,
		},
		body: JSON.stringify(convertKeysToSnakeCase(body)),
	});

	const { text }: SingleGeneration = JSON.parse(response);

	return text;
}
