import type { APIProvider } from '@/config';
import { TextGenerationLogSchema } from '@/schemas';
import { OpenAIModelsSchema } from '@/schemas/models';
import type { OpenAIModels, TextGenerationLog } from '@/types';
import localforage from 'localforage';
import { array, object, safeParseAsync } from 'valibot';

export class ForageStorage {
	private readonly keys = {
		TEXT_GENERATIONS: 'text-generations',
	};

	async getTextGenerationLogs() {
		const data = await localforage.getItem(this.keys.TEXT_GENERATIONS);

		const { success, output } = await safeParseAsync(
			object({
				data: array(TextGenerationLogSchema),
			}),
			data,
		);

		return success ? output.data : [];
	}

	async setTextGenerationLogs(logs: TextGenerationLog[]) {
		const result = await safeParseAsync(array(TextGenerationLogSchema), logs);

		if (!result.success) return;

		await localforage.setItem(this.keys.TEXT_GENERATIONS, {
			data: result.output,
		});
	}

	async deleteSingleTextGenerationLog(id: string) {
		const data = await localforage.getItem(this.keys.TEXT_GENERATIONS);

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

		await localforage.setItem(this.keys.TEXT_GENERATIONS, {
			data: result.output,
		});
	}

	async addTextGenerationLog(log: TextGenerationLog) {
		const data = await localforage.getItem(this.keys.TEXT_GENERATIONS);

		const { success, output } = await safeParseAsync(
			object({
				data: array(TextGenerationLogSchema),
			}),
			data,
		);

		if (!success) {
			await localforage.setItem(this.keys.TEXT_GENERATIONS, {
				data: [log],
			});
			return;
		}

		const result = await safeParseAsync(array(TextGenerationLogSchema), [
			...output.data,
			log,
		]);

		if (!result.success) return;

		await localforage.setItem(this.keys.TEXT_GENERATIONS, {
			data: result.output,
		});
	}

	/**
	 * Get the specified provider's model list from the storage
	 */
	async getModels(provider: APIProvider) {
		const data = await localforage.getItem(`${provider}-models`);

		const { success, output } = await safeParseAsync(OpenAIModelsSchema, data);

		return success ? output.data : [];
	}

	async setModels(provider: APIProvider, value: OpenAIModels['data']) {
		const _data = { data: value };
		const { success, output } = await safeParseAsync(OpenAIModelsSchema, _data);
		if (success) await localforage.setItem(`${provider}-models`, output);
	}
}
