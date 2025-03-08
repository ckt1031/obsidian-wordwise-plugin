import { handleTextOpenAI } from '@/provider/openai';
import type { CallTextAPIProps } from '@/types';

export async function callTextAPI(
	props: CallTextAPIProps,
): Promise<string | null | undefined> {
	const { model, allSettings, messages } = props;

	let requestModel = model;

	if (allSettings.customAiModel.length > 0 && allSettings.advancedSettings) {
		requestModel = allSettings.customAiModel;
	}

	if (messages.system.length === 0) {
		messages.system =
			'You are an Obsidian text processing assistant, help user to generate, modify and process text.';
	}

	if (messages.user.length === 0) {
		throw new Error('User message is empty');
	}

	return handleTextOpenAI({ ...props, model: requestModel });
}
