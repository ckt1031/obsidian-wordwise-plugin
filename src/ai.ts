import { request } from 'obsidian';

import { DEFAULT_API_HOST } from './config';
import { log } from './logging';
import type { PluginSettings } from './types';
import { checkAPIKey } from './utils/check-api-key';

export function getAPIHost(settings: PluginSettings): string {
	const urlPrefix = settings.openAiBaseUrl.startsWith('http') ? '' : 'http://';
	const host = settings.openAiBaseUrl.length > 0 ? settings.openAiBaseUrl : DEFAULT_API_HOST;

	return `${urlPrefix}${host}`;
}

export async function callAPI(
	settings: PluginSettings,
	prompt: string,
): Promise<string | undefined> {
	checkAPIKey(settings);

	const url = `${getAPIHost(settings)}/v1/chat/completions`;

	const body = {
		stream: false,
		model: settings.openAiModel,
		...(settings.advancedSettings && {
			temperature: settings.temperature,
			...(settings.maxTokens !== 0 && {
				max_tokens: settings.maxTokens,
			}),
			presence_penalty: settings.presencePenalty,
			frequency_penalty: settings.frequencyPenalty,
		}),
		messages: [
			{
				role: 'system',
				content:
					'You are helpful assistant to help the Obsidian Note app users, please keep the markdown format in your response.',
			},
			{
				role: 'user',
				content: prompt,
			},
		],
	};

	log(
		settings,
		`Sending request to ${url} (${settings.openAiModel}, Temp: ${settings.temperature}) with prompt ${prompt}`,
	);

	const response = await request({
		url,
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${settings.openAiApiKey}`,
		},
		body: JSON.stringify(body),
	});

	const json = JSON.parse(response);

	log(settings, `Received response: ${JSON.stringify(json)}`);

	return json.choices[0].message.content as string | undefined;
}
