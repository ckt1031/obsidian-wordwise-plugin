import { APIProvider, OPENROUTER_MODELS } from '@/config';
import { OpenAIModels, OpenAIModelsSchema } from '@/types';
import localforage from 'localforage';
import { safeParseAsync } from 'valibot';

export const forageStore = localforage.createInstance({
	name: 'WordWise',
});

export async function getModelsForage(provider: APIProvider) {
	const data = await forageStore.getItem(`${provider}-models`);

	const { success, output } = await safeParseAsync(OpenAIModelsSchema, data);

	return success ? output.data : OPENROUTER_MODELS;
}

export async function setModelsForage(
	provider: APIProvider,
	value: OpenAIModels['data'],
) {
	const _data = { data: value };
	const { success, output } = await safeParseAsync(OpenAIModelsSchema, _data);
	if (success) await forageStore.setItem(`${provider}-models`, output);
}
