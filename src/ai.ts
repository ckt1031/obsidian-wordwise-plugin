import dayjs from 'dayjs';
import { Notice, request } from 'obsidian';

import { log } from './logging';
import type {
	OpenAiBillingSubscription,
	OpenAiKeyCredit,
	OpenAiUsage,
	PluginSettings,
} from './types';

export async function checkCredits(settings: PluginSettings): Promise<OpenAiKeyCredit | undefined> {
	try {
		const billionResponse = await request({
			url: `${settings.openAiBaseUrl}/v1/dashboard/billing/subscription`,
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${settings.openAiApiKey}`,
			},
		});

		const billionData: OpenAiBillingSubscription = JSON.parse(billionResponse);

		const date = dayjs.unix(billionData.access_until).format('YYYY-MM-DD HH:mm:ss');

		// 90 days ago, in YYYY-MM-DD
		const start_date = dayjs().subtract(90, 'day').format('YYYY-MM-DD');
		// 1 day later, in YYYY-MM-DD
		const end_date = dayjs().add(1, 'day').format('YYYY-MM-DD');

		const usageResponse = await request({
			url: `${settings.openAiBaseUrl}/v1/dashboard/billing/usage?start_date=${start_date}&end_date=${end_date}`,
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${settings.openAiApiKey}`,
			},
		});

		const usageData: OpenAiUsage = JSON.parse(usageResponse);

		return {
			consumedCredits: usageData.total_usage / 100,
			remainingCredits: billionData.system_hard_limit_usd - usageData.total_usage / 100,
			totalCredits: billionData.system_hard_limit_usd,
			expiryDate: date,
		};
	} catch (error) {
		if (error instanceof Error) {
			log(settings, error.message);
			new Notice(`Provided API Key seemed to be invalid: ${error.message}`);
		}

		return undefined;
	}
}

export async function callAPI(
	settings: PluginSettings,
	prompt: string,
): Promise<string | undefined> {
	try {
		const url = `${settings.openAiBaseUrl}/v1/chat/completions`;

		const body = {
			stream: false,
			model: settings.openAiModel,
			temperature: settings.temperature,
			max_tokens: settings.maxTokens,
			presence_penalty: settings.presencePenalty,
			frequency_penalty: settings.frequencyPenalty,
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
	} catch (error) {
		if (error instanceof Error) {
			log(settings, error.message);
			new Notice(`Error requesting OpenAI: ${error.message}`);
			return undefined;
		}
	}
}
