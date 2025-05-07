import { Notice, request } from 'obsidian';

import type OpenAI from 'openai';

import type { APIProvider } from '@/config';
import type { PluginSettings, ProviderTextAPIProps } from '@/types';

/**
 * Azure OpenAI API is pretty weird, it does not support CORS, I had to re-implement it natively with Obsidian request API to bypass CORS issue.
 */
export async function handleTextAzure({
	baseURL,
	model,
	messages,
	plugin,
	providerSettings,
}: ProviderTextAPIProps) {
	// Reject if base URL is not set
	if (!providerSettings.baseUrl || providerSettings.baseUrl.length === 0) {
		throw new Error('Azure base URL is not set');
	}

	// Validate the API Version YYYY-MM-DD
	if (
		providerSettings.apiVersion &&
		!/\d{4}-\d{2}-\d{2}/.test(providerSettings.apiVersion)
	) {
		new Notice('Invalid Azure API Version, please enter in YYYY-MM-DD format');
		return;
	}

	const body: Omit<OpenAI.ChatCompletionCreateParams, 'model'> = {
		stream: false,
		temperature: plugin.settings.temperature,

		messages: [
			// Will be added later
			{
				role: 'user',
				content: messages.user.trim(),
			},
		],

		// Advanced settings here:
		...(plugin.settings.advancedSettings && {
			...(plugin.settings.maxTokens > 0 && {
				max_tokens: plugin.settings.maxTokens,
			}),
		}),
	};

	if (messages.system.length > 0) {
		if (
			plugin.settings.disableSystemInstructions &&
			plugin.settings.advancedSettings
		) {
			// Add system message to user message
			body.messages[0].content = `${messages.system.trim()}\n\n${body.messages[0].content}`;
		} else {
			// Add system message to the beginning
			body.messages.unshift({
				role: 'system',
				content: messages.system.trim(),
			});
		}
	}

	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
		'api-key': providerSettings.apiKey,
	};

	const path = `/openai/deployments/${model}/chat/completions?api-version=${(providerSettings as PluginSettings['aiProviderConfig'][APIProvider.AzureOpenAI]).apiVersion}`;

	try {
		const response = await request({
			url: `${baseURL}${path}`,
			headers,
			method: 'POST',
			body: JSON.stringify(body),
		});

		const resData: OpenAI.ChatCompletion = JSON.parse(response);

		// Check if it has choices and return the first one
		if (!resData.choices || resData.choices.length === 0) {
			throw new Error('Request failed', {
				cause: JSON.stringify(resData),
			});
		}

		return resData.choices[0].message.content;
	} catch (error) {
		throw new Error('Request failed', {
			cause: error instanceof Error ? error.message : String(error),
		});
	}
}
