import { request } from 'obsidian';

import { log } from './logging';
import type { PluginSettings } from './types';

export async function callAPI(settings: PluginSettings, prompt: string): Promise<string> {
	const url = `${settings.openAiBaseUrl}/v1/chat/completions`;

	const body = {
		stream: false,
		model: settings.openAiModel,
		temperature: settings.temperature,
		max_tokens: settings.maxTokens,
		messages: [
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
		url: `${settings.openAiBaseUrl}/v1/chat/completions`,
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${settings.openAiApiKey}`,
		},
		body: JSON.stringify(body),
	});

	const json = JSON.parse(response);

	log(settings, `Received response: ${JSON.stringify(json)}`);

	const content = json.choices[0].message.content as string | undefined;

	if (!content) {
		throw new Error('No content returned from OpenAI');
	}

	return content;
}
