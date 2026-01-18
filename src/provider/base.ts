import type { LanguageModel } from 'ai';
import { generateText, streamText } from 'ai';

import type { ProviderTextAPIProps } from '@/types';

export abstract class BaseProvider {
	protected abstract createModel(
		modelId: string,
		providerSettings: ProviderTextAPIProps['providerSettings'],
		provider: string,
	): LanguageModel;

	async handleText(props: ProviderTextAPIProps): Promise<string | undefined> {
		const {
			model: modelId,
			messages,
			plugin,
			providerSettings,
			provider,
			isTesting = false,
			stream,
			onStreamText,
			onStreamComplete,
		} = props;

		if (!isTesting) {
			plugin.generationRequestAbortController = new AbortController();
			plugin.updateStatusBar();
		}

		const bodyMessages: {
			role: 'system' | 'user' | 'assistant';
			content: string;
		}[] = [];

		if (messages.system.length > 0) {
			if (
				plugin.settings.disableSystemInstructions &&
				plugin.settings.advancedSettings
			) {
				bodyMessages.push({
					role: 'user',
					content: `${messages.system.trim()}\n\n${messages.user.trim()}`,
				});
			} else {
				bodyMessages.push({
					role: 'system',
					content: messages.system.trim(),
				});
				bodyMessages.push({
					role: 'user',
					content: messages.user.trim(),
				});
			}
		} else {
			bodyMessages.push({
				role: 'user',
				content: messages.user.trim(),
			});
		}

		try {
			const model = this.createModel(modelId, providerSettings, provider);

			const commonProps = {
				model,
				messages: bodyMessages,
				temperature: providerSettings.temperature || 0.6,
				abortSignal: isTesting
					? undefined
					: plugin.generationRequestAbortController?.signal,
				...(plugin.settings.advancedSettings && {
					maxTokens:
						providerSettings.maxTokens && providerSettings.maxTokens > 0
							? providerSettings.maxTokens
							: undefined,
				}),
			};

			if (stream) {
				const { textStream } = streamText(commonProps);

				let fullText = '';
				for await (const textPart of textStream) {
					fullText += textPart;
					onStreamText?.(textPart);
				}

				onStreamComplete?.();
				return fullText;
			}

			const { text } = await generateText(commonProps);
			return text;
		} catch (error) {
			throw new Error('Request failed', {
				cause:
					error instanceof Error ? error.cause || error.message : String(error),
			});
		} finally {
			plugin.generationRequestAbortController = null;
			if (!isTesting) plugin.updateStatusBar();
		}
	}
}
