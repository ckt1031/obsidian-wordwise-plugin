import { DEFAULT_HOST } from '@/config';
import type { ProviderTextAPIProps } from '@/types';
import { getAPIHost } from '@/utils/get-url-host';
import type {
	GenerateContentRequest,
	GenerateContentResponse,
} from '@google/generative-ai';
import { request } from 'obsidian';

export async function handleTextGoogleGenAI({
	plugin,
	messages,
	model,
}: ProviderTextAPIProps) {
	const { settings } = plugin;

	const providerSettings = settings.aiProviderConfig[settings.aiProvider];

	const body: GenerateContentRequest = {
		contents: [
			{
				role: 'user',
				parts: [
					{
						text: `${messages.system}\n\n${messages.user}`,
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
		providerSettings.baseUrl,
		DEFAULT_HOST[settings.aiProvider],
	)}/v1beta/models/${model}:generateContent?key=${providerSettings.apiKey}`;

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
