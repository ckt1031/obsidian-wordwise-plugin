import { APIProvider } from '@/config';
import { handleTextAnthropicAI } from '@/provider/anthropic';
import { handleTextCohere } from '@/provider/cohere';
import { handleTextGoogleGenAI } from '@/provider/google-ai';
import { handleTextOpenAI } from '@/provider/openai';
import { type CallAPIProps } from '@/types';
import { log } from './logging';

export async function callTextAPI({
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

	if (
		apiProvider === APIProvider.OpenAI ||
		apiProvider === APIProvider.OpenRouter ||
		apiProvider === APIProvider.AzureOpenAI
	) {
		return handleTextOpenAI({ plugin, userMessage, customAiModel });
	}

	if (apiProvider === APIProvider.Anthropic) {
		return handleTextAnthropicAI({ plugin, userMessage, customAiModel });
	}

	if (apiProvider === APIProvider.GoogleGemini) {
		return handleTextGoogleGenAI({ plugin, userMessage, customAiModel });
	}

	if (apiProvider === APIProvider.Cohere) {
		return handleTextCohere({ plugin, userMessage, customAiModel });
	}

	throw new Error(`Unknown API Provider: ${apiProvider}`);
}
