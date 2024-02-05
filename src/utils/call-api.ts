import { handleTextAnthropicAI } from '@/provider/anthropic';
import { handleTextGoogleGenAI } from '@/provider/google-ai';
import { handleTextOpenAI } from '@/provider/openai';
import { APIProvider, type CallAPIProps } from '@/types';
import { log } from './logging';

export async function callAPI({
	settings,
	userMessage,
}: CallAPIProps): Promise<string | null | undefined> {
	const apiProvider = settings.aiProvider;

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
			return handleTextOpenAI({ settings, userMessage, customAiModel });
		}
		case APIProvider.Anthropic: {
			return handleTextAnthropicAI({ settings, userMessage, customAiModel });
		}
		case APIProvider.GoogleGemini: {
			return handleTextGoogleGenAI({ settings, userMessage, customAiModel });
		}
		default:
			throw new Error(`Unknown API Provider: ${apiProvider}`);
	}
}
