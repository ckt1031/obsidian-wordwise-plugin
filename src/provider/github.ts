import { requestUrl } from 'obsidian';

import { createOpenAI } from '@ai-sdk/openai';
import { parseAsync } from 'valibot';

import { APIProvider, PROVIDER_DEFAULTS } from '@/config';
import { GitHubModelsSchema } from '@/schemas/models';
import type { Models, ProviderTextAPIProps } from '@/types';
import { getAPIHost } from '@/utils/get-url-host';
import { BaseProvider } from './base';

export type ModelRequestProps = {
	host: string;
	apiKey: string;
	provider: string;
};

export async function getGitHubModels({
	host,
	apiKey,
	provider,
}: ModelRequestProps): Promise<Models> {
	const path = PROVIDER_DEFAULTS[APIProvider.GitHub].models;
	const response = await requestUrl({
		url: `${host}${path}`,
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${apiKey}`,
		},
	});

	if (response.status !== 200) {
		throw new Error(response.text);
	}

	let models = await parseAsync(GitHubModelsSchema, response.json);

	// Filter off models with name embed, whisper, tts
	models = models.filter((model) => model.task === 'chat-completion');

	return models.map((model) => ({
		id: model.name,
		name: model.friendly_name,
		provider,
	}));
}

export class GitHubProvider extends BaseProvider {
	protected createModel(
		modelId: string,
		providerSettings: ProviderTextAPIProps['providerSettings'],
	) {
		const { apiKey, baseUrl } = providerSettings;

		const host = getAPIHost(
			baseUrl,
			PROVIDER_DEFAULTS[APIProvider.GitHub].host,
		);

		const github = createOpenAI({
			apiKey,
			baseURL: host,
		});

		return github.chat(modelId);
	}
}

export async function handleTextGitHub(props: ProviderTextAPIProps) {
	return new GitHubProvider().handleText(props);
}
