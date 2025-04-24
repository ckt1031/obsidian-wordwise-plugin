import { APIProvider } from '@/config';
import { handleTextAzure } from '@/provider/azure-openai';
import { handleTextOpenAI } from '@/provider/openai';
import type { CallTextAPIProps } from '@/types';

export async function callTextAPI(
	props: CallTextAPIProps,
): Promise<string | null | undefined> {
	const { plugin, messages, model } = props;

	let requestModel = model;

	if (
		plugin.settings.customAiModel.length > 0 &&
		plugin.settings.advancedSettings
	) {
		requestModel = plugin.settings.customAiModel;
	}

	// if (messages.system.length === 0) {
	// 	messages.system =
	// 		'You are an Obsidian text processing assistant, help user to generate, modify and process text.';
	// }

	if (messages.user.length === 0) {
		throw new Error('User message is empty');
	}

	if (props.provider === APIProvider.AzureOpenAI) {
		return handleTextAzure({ ...props, model: requestModel });
	}

	return handleTextOpenAI({ ...props, model: requestModel });
}
