import { DEFAULT_HOST } from '@/config';
import type { ProviderTextAPIProps } from '@/types';
import { getAPIHost } from '@/utils/get-url-host';
import isV1Needed from '@/utils/is-v1-needed';
import type {
	Message,
	MessageCreateParams,
} from '@anthropic-ai/sdk/resources/messages';
import { request } from 'obsidian';

export async function handleTextAnthropicAI({
	plugin,
	messages,
	model,
}: ProviderTextAPIProps) {
	const { settings } = plugin;

	const providerSettings = settings.aiProviderConfig[settings.aiProvider];

	const body: MessageCreateParams = {
		messages: [
			{
				role: 'user',
				content: `${messages.system}\n\n${messages.user}`,
			},
		],
		model,
		stream: false,
		max_tokens:
			settings.advancedSettings && settings.maxTokens !== 0
				? settings.maxTokens
				: 2048,
		temperature: settings.advancedSettings ? settings.temperature : 0.5,
	};

	const urlHost = getAPIHost(
		providerSettings.baseUrl,
		DEFAULT_HOST[settings.aiProvider],
	);

	const versionPath = isV1Needed(urlHost) ? '/v1' : '';

	const url = `${urlHost}${versionPath}/messages`;

	const response = await request({
		url,
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'anthropic-version': '2023-06-01',
			'x-api-key': providerSettings.apiKey,
		},
		body: JSON.stringify(body),
	});

	const json: Message = JSON.parse(response);

	return json.content[0].text;
}
