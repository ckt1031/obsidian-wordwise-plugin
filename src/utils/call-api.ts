import { handleAnthropicAI } from '../provider/anthropic';
import { handleGoogleGenAI } from '../provider/google-ai';
import { handleOpenAI } from '../provider/openai';
import { APIProvider, type CallAPIProps } from '../types';
import { log } from './logging';

export async function callAPI({
	settings,
	userMessage,
}: CallAPIProps): Promise<string | null | undefined> {
	const apiProvider = settings.apiProvider;

	let customAiModel = '';

	if (settings.customAiModel.length > 0 && settings.advancedSettings) {
		customAiModel = settings.customAiModel;
	}

	log(
		settings,
		`Sending request to ${apiProvider} with prompt:\n\n${userMessage}`,
	);

	switch (apiProvider) {
		case APIProvider.OpenAI: {
			return handleOpenAI({ settings, userMessage, customAiModel });
		}
		case APIProvider.Anthropic: {
			return handleAnthropicAI({ settings, userMessage, customAiModel });
		}
		case APIProvider.GoogleGemini: {
			return handleGoogleGenAI({ settings, userMessage, customAiModel });
		}
		default:
			throw new Error(`Unknown API Provider: ${apiProvider}`);
	}
}
