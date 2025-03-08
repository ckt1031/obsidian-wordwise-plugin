import { handleTextOpenAI } from '@/provider/openai';
import type { CallTextAPIProps } from '@/types';
import { log } from './logging';

export async function callTextAPI({
	plugin,
	messages,
	provider,
	model: requestModel,
}: CallTextAPIProps): Promise<string | null | undefined> {
	const { settings } = plugin;

	const apiProvider = provider ?? settings.aiProvider;

	let model =
		requestModel ?? settings.aiProviderConfig[settings.aiProvider].model;

	if (settings.customAiModel.length > 0 && settings.advancedSettings) {
		model = settings.customAiModel;
	}

	if (messages.system.length === 0) {
		messages.system =
			'You are an Obsidian text processing assistant, help user to generate, modify and process text.';
	}

	if (messages.user.length === 0) {
		throw new Error('User message is empty');
	}

	log(
		plugin,
		`Sending request to ${apiProvider} with prompt:\nSystem: ${messages.system}\nUser: ${messages.user}`,
	);

	return handleTextOpenAI({ plugin, messages, model });
}
