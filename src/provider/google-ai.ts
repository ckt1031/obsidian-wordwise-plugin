import { DEFAULT_HOST } from '@/config';
import { GoogleGenAIModelsSchema } from '@/schemas/models';
import type { Models, ProviderTextAPIProps } from '@/types';
import { getAPIHost } from '@/utils/get-url-host';
import type {
	GenerateContentRequest,
	GenerateContentResponse,
} from '@google/generative-ai';
import { requestUrl } from 'obsidian';
import { parseAsync } from 'valibot';

export async function getGoogleGenAIModels({
	plugin,
}: Pick<ProviderTextAPIProps, 'plugin'>): Promise<Models> {
	const { settings } = plugin;
	const providerSettings = settings.aiProviderConfig[settings.aiProvider];

	const host = getAPIHost(
		providerSettings.baseUrl,
		DEFAULT_HOST[settings.aiProvider],
	);

	const url = `${host}/v1beta/models?key=${providerSettings.apiKey}`;

	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
	};

	const response = await requestUrl({
		url,
		method: 'GET',
		headers: headers,
	});

	if (response.status !== 200) {
		throw new Error(response.text);
	}

	const data = await parseAsync(
		GoogleGenAIModelsSchema,
		JSON.parse(response.text),
	);

	const list: Models = [];

	for (const model of data.models) {
		if (model.supportedGenerationMethods.includes('generateContent')) {
			list.push({
				id: model.name.replace('models/', ''),
				name: model.displayName,
			});
		}
	}

	return list;
}

export async function handleTextGoogleGenAI({
	plugin,
	messages,
	model,
}: ProviderTextAPIProps) {
	const { settings } = plugin;

	const providerSettings = settings.aiProviderConfig[settings.aiProvider];

	const body: GenerateContentRequest = {
		systemInstruction: {
			role: 'system',
			parts: [
				{
					text: messages.system,
				},
			],
		},
		contents: [
			{
				role: 'user',
				parts: [
					{
						text: messages.user,
					},
				],
			},
		],
		generationConfig: {
			...(settings.advancedSettings && {
				...(settings.maxTokens > 0 && {
					maxOutputTokens: settings.maxTokens,
				}),
				temperature: settings.temperature,
			}),
		},
	};

	const url = `${getAPIHost(
		providerSettings.baseUrl,
		DEFAULT_HOST[settings.aiProvider],
	)}/v1beta/models/${model}:generateContent?key=${providerSettings.apiKey}`;

	const response = await requestUrl({
		url,
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(body),
	});

	if (response.status !== 200) {
		throw new Error(response.text);
	}

	const { candidates }: GenerateContentResponse = JSON.parse(response.text);

	if (!candidates || candidates.length === 0) {
		throw new Error('No response from Google AI');
	}

	return candidates[0].content.parts[0].text;
}
