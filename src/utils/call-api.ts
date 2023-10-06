/* eslint-disable no-mixed-spaces-and-tabs */
import { request } from 'obsidian';

import { DEFAULT_API_HOST } from '../config';
import type { CallAPIProps, PluginSettings } from '../types';
import { checkAPIKey } from './check-api-key';
import { log } from './logging';

export function getAPIHost(settings: PluginSettings): string {
	const urlPrefix = settings.openAiBaseUrl.startsWith('http') ? '' : 'http://';
	const host = settings.openAiBaseUrl.length > 0 ? settings.openAiBaseUrl : DEFAULT_API_HOST;

	return `${urlPrefix}${host}`;
}

export async function callAPI({
	settings,
	userMessages,
	enableSystemMessages = true,
}: CallAPIProps): Promise<string | undefined> {
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
			...(enableSystemMessages
				? [
						{
							role: 'system',
							content:
								'You are helping the Obsidian Note app users, keep markdown format in response.',
						},
				  ]
				: []),
			{
				role: 'user',
				content: userMessages,
			},
		],
	};

	log(
		settings,
		`Sending request to ${url} (${settings.openAiModel}, Temp: ${settings.temperature}) with prompt ${userMessages}`,
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
