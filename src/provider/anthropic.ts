import { ChatAnthropic } from '@langchain/anthropic';
import { HumanMessage } from '@langchain/core/messages';
import { DEFAULT_ANTHROPIC_API_HOST } from '../config';
import { AIProviderProps } from '../types';
import { getAPIHost } from '../utils/get-url-hsot';
import { handleInvoke } from '../utils/handle-invoke-response';

export async function handleAnthropicAI({
	settings,
	userMessage,
	customAiModel = '',
}: AIProviderProps) {
	const modelName =
		customAiModel.length > 0 ? customAiModel : settings.anthropicApiKey;

	const chat = new ChatAnthropic({
		modelName: modelName,
		anthropicApiKey: settings.openAiApiKey,
		anthropicApiUrl: getAPIHost(
			settings.openAiBaseUrl,
			DEFAULT_ANTHROPIC_API_HOST,
		),
		// Advanced settings
		temperature: settings.advancedSettings ? settings.temperature : 0.5,
		maxTokens: settings.advancedSettings ? settings.maxTokens : 2000,
	});

	const { content } = await chat.invoke([new HumanMessage(userMessage)]);

	return handleInvoke(content);
}
