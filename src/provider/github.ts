import { requestUrl } from 'obsidian';

import { parseAsync } from 'valibot';

import { GitHubModelsSchema } from '@/schemas/models';
import type { Models } from '@/types';

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
	const response = await requestUrl({
		url: `${host}/models`,
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
