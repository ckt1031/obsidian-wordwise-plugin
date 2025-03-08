import { AnthropicModelsSchema } from '@/schemas/models';
import type { Models } from '@/types';
import { requestUrl } from 'obsidian';
import { parseAsync } from 'valibot';
import type { ModelRequestProps } from './openai';

export async function getAnthropicModels({
	host,
	apiKey,
}: ModelRequestProps): Promise<Models> {
	const url = `${host}/v1/models`;

	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
		'anthropic-version': '2023-06-01',
		'x-api-key': apiKey,
	};

	const response = await requestUrl({
		url,
		method: 'GET',
		headers: headers,
	});

	if (response.status !== 200) {
		throw new Error(response.text);
	}

	const data = await parseAsync(
		AnthropicModelsSchema,
		JSON.parse(response.text),
	);

	const list: Models = [];

	for (const model of data.models) {
		list.push({
			id: model.id,
			name: model.displayName,
		});
	}

	return list;
}
