import { Notice, setIcon, setTooltip, type TextComponent } from 'obsidian';

import { APIProvider } from '@/config';
import type WordWisePlugin from '@/main';
import ErrorDialogModal from '@/modals/error-dialog';
import { callTextAPI } from '@/utils/call-api';

type Props = {
	text: TextComponent;
	plugin: WordWisePlugin;
};

// Main function to wrap the password component
export const wrapAPITestComponent = ({ text, plugin }: Props) => {
	// Create a new hider element
	const button = text.inputEl.insertAdjacentElement(
		'beforebegin',
		document.createElement('button'),
	) as HTMLElement;

	if (!button) return;

	setTooltip(button, 'Test API');

	// Set the initial icon for the hider element
	setIcon(button, 'fan');

	// Add a click event listener to the hider element
	button.addEventListener('click', async () => {
		const providerSettings =
			plugin.settings.aiProviderConfig[plugin.settings.aiProvider];

		const modelToCall =
			providerSettings.customModelId &&
			providerSettings.customModelId.length > 0
				? providerSettings.customModelId
				: providerSettings.model;

		const hasNoModelConfigurated = !modelToCall || modelToCall.length === 0;

		// Warn if Azure OpenAI has no model
		if (
			plugin.settings.aiProvider === APIProvider.AzureOpenAI &&
			hasNoModelConfigurated
		) {
			new Notice(
				'You must configure the model ID from Azure OpenAI in the settings',
			);
			return;
		}

		if (hasNoModelConfigurated) {
			new Notice(
				'Please fetch the models first and select a model first or set custom model',
			);
			return;
		}

		try {
			const result = await callTextAPI({
				plugin,
				providerSettings,

				baseURL: providerSettings.baseUrl,
				model: modelToCall,
				apiKey: providerSettings.apiKey,

				provider: plugin.settings.aiProvider,
				messages: {
					system: '',
					user: 'Say word hello only.',
				},

				isTesting: true,
				stream: false,
			});

			if (!result || result.length === 0) {
				new Notice(`No result from ${plugin.settings.aiProvider}`);
				return;
			}

			new Notice('API is working properly');

			// Set the icon to success
			setIcon(button, 'badge-check');
			// Set icon green with effect
			button.style.color = '#28FF1E';
		} catch (error) {
			// Set the icon to error
			setIcon(button, 'server-crash');
			// Set icon red with effect
			button.style.color = '#FF0000';

			let message = 'API is not working properly';

			if (error instanceof Error) {
				message += `: ${error.message}`;

				if (typeof error.cause === 'string' || error.cause instanceof Error) {
					new ErrorDialogModal(
						plugin,
						`Test API Failed: ${providerSettings.model}`,
						error.cause,
					).open();
				}
			}

			// Log the error to the console
			console.info(error);

			new Notice(message);
		}
	});

	return text;
};
