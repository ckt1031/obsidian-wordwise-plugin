import { DEFAULT_HOST } from '@/config';
import { GoogleGenAIModelsSchema } from '@/schemas/models';
import type { ProviderTextAPIProps, UniformModels } from '@/types';
import { getAPIHost } from '@/utils/get-url-host';
import type {
	GenerateContentRequest,
	GenerateContentResponse,
} from '@google/generative-ai';
import { request } from 'obsidian';
import { parseAsync } from 'valibot';

export async function getGoogleGenAIModels({
	plugin,
}: Pick<ProviderTextAPIProps, 'plugin'>): Promise<UniformModels> {
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

	const response = await request({
		url,
		method: 'GET',
		headers: headers,
	});

	const data = await parseAsync(GoogleGenAIModelsSchema, JSON.parse(response));

	const list: UniformModels = [];

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
