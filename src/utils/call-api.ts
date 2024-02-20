import { APIProvider } from '@/config';
import { handleTextAnthropicAI } from '@/provider/anthropic';
import { handleTextCohere } from '@/provider/cohere';
import { handleTextGoogleGenAI } from '@/provider/google-ai';
import { handleTextOpenAI } from '@/provider/openai';
import { type CallAPIProps } from '@/types';
import { log } from './logging';

export async function callAPI({
	plugin,
	userMessage,
}: CallAPIProps): Promise<string | null | undefined> {
	const { settings } = plugin;

	const apiProvider = settings.aiProvider;

	let customAiModel = '';

	if (settings.customAiModel.length > 0 && settings.advancedSettings) {
		customAiModel = settings.customAiModel;
	}

	log(
		plugin,
		`Sending request to ${apiProvider} with prompt:\n\n${userMessage}`,
	);

	switch (apiProvider) {
		case APIProvider.OpenAI: {
			return handleTextOpenAI({ plugin, userMessage, customAiModel });
		}
		case APIProvider.AzureOpenAI: {
			return handleTextOpenAI({ plugin, userMessage, customAiModel });
		}
		case APIProvider.Anthropic: {
			return handleTextAnthropicAI({ plugin, userMessage, customAiModel });
		}
		case APIProvider.GoogleGemini: {
			return handleTextGoogleGenAI({ plugin, userMessage, customAiModel });
		}
		case APIProvider.Cohere: {
			return handleTextCohere({ plugin, userMessage, customAiModel });
		}
		default:
			throw new Error(`Unknown API Provider: ${apiProvider}`);
	}
}
