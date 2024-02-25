import { APIProvider, OPENROUTER_MODELS } from '@/config';
import {
	OpenAIModels,
	OpenAIModelsSchema,
	TextGenerationLog,
	TextGenerationLogSchema,
} from '@/types';
import localforage from 'localforage';
import { array, object, safeParseAsync } from 'valibot';

enum StorageKey {
	TEXT_GENERATIONS = 'text-generations',
}

const forageStore = localforage.createInstance({
	name: 'WordWise',
});

export class ForageStorage {
	async getTextGenerationLogs() {
		const data = await forageStore.getItem(StorageKey.TEXT_GENERATIONS);

		const { success, output } = await safeParseAsync(
			object({
				data: array(TextGenerationLogSchema),
			}),
			data,
		);

		return success ? output.data : [];
	}

	async deleteSingleTextGenerationLog(id: string) {
		const data = await forageStore.getItem(StorageKey.TEXT_GENERATIONS);

		const { success, output } = await safeParseAsync(
			object({
				data: array(TextGenerationLogSchema),
			}),
			data,
		);

		if (!success) return;

		const result = await safeParseAsync(
			array(TextGenerationLogSchema),
			output.data.filter((log) => log.id !== id),
		);

		if (!result.success) return;

		await forageStore.setItem(StorageKey.TEXT_GENERATIONS, {
			data: result.output,
		});
	}

	async addTextGenerationLog(log: TextGenerationLog) {
		const data = await forageStore.getItem(StorageKey.TEXT_GENERATIONS);

		const { success, output } = await safeParseAsync(
			object({
				data: array(TextGenerationLogSchema),
			}),
			data,
		);

		if (!success) {
			await forageStore.setItem(StorageKey.TEXT_GENERATIONS, {
				data: [log],
			});
			return;
		}

		const result = await safeParseAsync(array(TextGenerationLogSchema), [
			...output.data,
			log,
		]);

		if (!result.success) return;

		await forageStore.setItem(StorageKey.TEXT_GENERATIONS, {
			data: result.output,
		});
	}

	/**
	 * Get the specified provider's model list from the storage
	 */
	async getModels(provider: APIProvider) {
		const data = await forageStore.getItem(`${provider}-models`);

		const { success, output } = await safeParseAsync(OpenAIModelsSchema, data);

		return success ? output.data : OPENROUTER_MODELS;
	}

	async setModels(provider: APIProvider, value: OpenAIModels['data']) {
		const _data = { data: value };
		const { success, output } = await safeParseAsync(OpenAIModelsSchema, _data);
		if (success) await forageStore.setItem(`${provider}-models`, output);
	}
}
