import { APIProvider, OPENROUTER_MODELS } from '@/config';
import {
	OpenAIModels,
	OpenAIModelsSchema,
	TextGenerationLoggings,
	TextGenerationLoggingsSchema,
} from '@/types';
import localforage from 'localforage';
import { array, object, safeParseAsync } from 'valibot';

export class ForageStorage {
	forageStore = localforage.createInstance({
		name: 'WordWise',
	});

	async getLog() {
		const data = await this.forageStore.getItem('text-generations');

		const { success, output } = await safeParseAsync(
			object({
				data: array(TextGenerationLoggingsSchema),
			}),
			data,
		);

		return success ? output.data : [];
	}

	async addLog(log: TextGenerationLoggings) {
		const data = await this.forageStore.getItem('text-generations');

		const { success, output } = await safeParseAsync(
			object({
				data: array(TextGenerationLoggingsSchema),
			}),
			data,
		);

		if (!success) {
			await this.forageStore.setItem('text-generations', {
				data: [log],
			});
			return;
		}

		const result = await safeParseAsync(array(TextGenerationLoggingsSchema), [
			...output.data,
			log,
		]);

		if (!result.success) return;

		await this.forageStore.setItem('text-generations', {
			data: result.output,
		});
	}

	async getModels(provider: APIProvider) {
		const data = await this.forageStore.getItem(`${provider}-models`);

		const { success, output } = await safeParseAsync(OpenAIModelsSchema, data);

		return success ? output.data : OPENROUTER_MODELS;
	}

	async setModels(provider: APIProvider, value: OpenAIModels['data']) {
		const _data = { data: value };
		const { success, output } = await safeParseAsync(OpenAIModelsSchema, _data);
		if (success) await this.forageStore.setItem(`${provider}-models`, output);
	}
}
