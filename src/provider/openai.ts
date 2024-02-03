import { HumanMessage } from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';
import { DEFAULT_OPENAI_API_HOST } from '../config';
import { AIProviderProps } from '../types';
import { getAPIHost } from '../utils/get-url-hsot';
import { handleInvoke } from '../utils/handle-invoke-response';

export async function handleOpenAI({
	settings,
	userMessage,
	customAiModel = '',
}: AIProviderProps) {
	const modelName =
		customAiModel.length > 0 ? customAiModel : settings.openAiModel;

	const chat = new ChatOpenAI({
		modelName: modelName,
		openAIApiKey: settings.openAiApiKey,
		configuration: {
			baseURL: `${getAPIHost(
				settings.openAiBaseUrl,
				DEFAULT_OPENAI_API_HOST,
			)}/v1`,
		},
		// Advanced settings
		temperature: settings.advancedSettings ? settings.temperature : 0.5,
		maxTokens: settings.advancedSettings ? settings.maxTokens : 2000,
		presencePenalty: settings.advancedSettings ? settings.presencePenalty : 0.0,
		frequencyPenalty: settings.advancedSettings
			? settings.frequencyPenalty
			: 0.0,
	});

	const { content } = await chat.invoke([new HumanMessage(userMessage)]);

	return handleInvoke(content);
}
