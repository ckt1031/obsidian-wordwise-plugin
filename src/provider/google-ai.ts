import { DEFAULT_GOOGLE_AI_API_HOST } from '@/config';
import { AIProviderProps } from '@/types';
import { getAPIHost } from '@/utils/get-url-hsot';
import type {
	GenerateContentRequest,
	GenerateContentResponse,
} from '@google/generative-ai';
import { request } from 'obsidian';

export async function handleTextGoogleGenAI({
	settings,
	userMessage,
	customAiModel = '',
}: AIProviderProps) {
	const modelName =
		customAiModel.length > 0 ? customAiModel : settings.googleAIModel;

	const body: GenerateContentRequest = {
		contents: [
			{
				role: 'user',
				parts: [
					{
						text: userMessage,
					},
				],
			},
		],
		generationConfig: {
			temperature: settings.advancedSettings ? settings.temperature : 0.5,
			maxOutputTokens: settings.advancedSettings ? settings.maxTokens : 2000,
		},
	};

	const url = `${getAPIHost(
		settings.googleAIBaseUrl,
		DEFAULT_GOOGLE_AI_API_HOST,
	)}/v1beta/models/${modelName}:generateContent?key=${settings.googleAIApiKey}`;

	const response = await request({
		url,
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(body),
	});

	const { candidates }: GenerateContentResponse = JSON.parse(response);

	if (!candidates || candidates.length === 0) {
		throw new Error('No response from Google AI');
	}

	return candidates[0].content.parts[0].text;
}
