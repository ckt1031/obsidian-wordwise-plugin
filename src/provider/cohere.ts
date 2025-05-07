import { parseAsync } from 'valibot';

import { CohereModelsSchema } from '@/schemas/models';
import type { Models } from '@/types';
import type { ModelRequestProps } from './openai';

export async function getCohereModels({
	host,
	apiKey,
}: ModelRequestProps): Promise<Models> {
	const url = `${host}/v1/models`;

	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
		Authorization: `Bearer ${apiKey}`,
	};

	const response = await fetch(url, {
		headers: headers,
	});

	if (response.status !== 200) {
		throw new Error(await response.text());
	}

	const { models } = await parseAsync(
		CohereModelsSchema,
		await response.json(),
	);

	const list: Models = [];

	for (const model of models) {
		const endpoint = model.endpoints ?? [];

		if (!endpoint.includes('chat') || !model.name) {
			continue;
		}

		list.push({
			id: model.name,
			name: model.name,
		});
	}

	return list;
}
