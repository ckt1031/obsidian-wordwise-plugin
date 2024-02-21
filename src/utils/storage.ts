import { OPENROUTER_MODELS } from '@/config';
import { OpenAIModels, OpenAIModelsSchema } from '@/types';
import localforage from 'localforage';
import { safeParseAsync } from 'valibot';

export const forageStore = localforage.createInstance({
	name: 'WordWise',
	driver: localforage.LOCALSTORAGE,
});

enum Keys {
	OpenRouterModels = 'openrouter-models',
}

export async function getOpenRouterForage() {
	const data = await forageStore.getItem(Keys.OpenRouterModels);

	const { success, output } = await safeParseAsync(OpenAIModelsSchema, data);

	return success ? output.data : OPENROUTER_MODELS;
}

export async function setOpenRouterForage(value: OpenAIModels['data']) {
	const _data = { data: value };
	const { success, output } = await safeParseAsync(OpenAIModelsSchema, _data);
	if (success) await forageStore.setItem(Keys.OpenRouterModels, output);
}
