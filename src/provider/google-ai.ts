import { HumanMessage } from '@langchain/core/messages';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { AIProviderProps } from '../types';
import { handleInvoke } from '../utils/handle-invoke-response';

export async function handleGoogleGenAI({
	settings,
	userMessage,
	customAiModel = '',
}: AIProviderProps) {
	const modelName =
		customAiModel.length > 0 ? customAiModel : settings.googleAIModel;

	const chat = new ChatGoogleGenerativeAI({
		modelName,
		apiKey: settings.googleAIApiKey,
		streaming: false,
		// Advanced settings
		temperature: settings.advancedSettings ? settings.temperature : 0.5,
		maxOutputTokens: settings.advancedSettings ? settings.maxTokens : 2000,
	});

	const { content } = await chat.invoke([new HumanMessage(userMessage)]);

	return handleInvoke(content);
}
