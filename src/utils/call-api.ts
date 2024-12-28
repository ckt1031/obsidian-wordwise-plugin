import { APIProvider } from '@/config';
import { handleTextAnthropicAI } from '@/provider/anthropic';
import { handleTextCohere } from '@/provider/cohere';
import { handleTextGoogleGenAI } from '@/provider/google-ai';
import { handleTextOllama } from '@/provider/ollama';
import { handleTextOpenAI } from '@/provider/openai';
import type { CallTextAPIProps } from '@/types';
import { log } from './logging';

export async function callTextAPI({
	plugin,
	messages,
	provider,
	model: _model,
}: CallTextAPIProps): Promise<string | null | undefined> {
	const { settings } = plugin;

	const apiProvider = provider ?? settings.aiProvider;

	let model = _model ?? settings.aiProviderConfig[settings.aiProvider].model;

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

	if (
		apiProvider === APIProvider.OpenAI ||
		apiProvider === APIProvider.OpenRouter ||
		apiProvider === APIProvider.AzureOpenAI ||
		apiProvider === APIProvider.PerplexityAI ||
		apiProvider === APIProvider.Custom
	) {
		return handleTextOpenAI({ plugin, messages, model });
	}

	if (apiProvider === APIProvider.Ollama) {
		return handleTextOllama({ plugin, messages, model });
	}

	if (apiProvider === APIProvider.Anthropic) {
		return handleTextAnthropicAI({ plugin, messages, model });
	}

	if (apiProvider === APIProvider.GoogleGemini) {
		return handleTextGoogleGenAI({ plugin, messages, model });
	}

	if (apiProvider === APIProvider.Cohere) {
		return handleTextCohere({ plugin, messages, model });
	}

	throw new Error(`Unknown API Provider: ${apiProvider}`);
}
