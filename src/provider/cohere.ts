import { DEFAULT_HOST } from '@/config';
import type { ProviderTextAPIProps } from '@/types';
import { getAPIHost } from '@/utils/get-url-host';
import type { ChatRequest, Generation } from 'cohere-ai/api';
import { request } from 'obsidian';
import snakecaseKeys from 'snakecase-keys';

export async function handleTextCohere({
	plugin,
	messages,
	model,
}: ProviderTextAPIProps) {
	const { settings } = plugin;

	const providerSettings = settings.aiProviderConfig[settings.aiProvider];

	const body: ChatRequest = {
		model,
		message: `${messages.system}\n\n${messages.user}`,
		temperature: settings.advancedSettings ? settings.temperature : 0.5,
		maxTokens: settings.advancedSettings ? settings.maxTokens : 2000,
		frequencyPenalty: settings.advancedSettings
			? settings.frequencyPenalty
			: 0.0,
	};

	const url = `${getAPIHost(
		providerSettings.baseUrl,
		DEFAULT_HOST[settings.aiProvider],
	)}/v1/chat`;

	const response = await request({
		url,
		method: 'POST',
		headers: {
			accept: 'application/json',
			'Content-Type': 'application/json',
			Authorization: `Bearer ${providerSettings.apiKey}`,
		},
		body: JSON.stringify(
			snakecaseKeys(body as unknown as Record<string, unknown>),
		),
	});

	const { generations }: Generation = JSON.parse(response);

	return generations[0].text;
}
