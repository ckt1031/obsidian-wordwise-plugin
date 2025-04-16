import type WordWisePlugin from '@/main';
import ErrorDialogModal from '@/modals/error-dialog';
import { callTextAPI } from '@/utils/call-api';
import { Notice, type TextComponent, setIcon, setTooltip } from 'obsidian';

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
	setIcon(button, 'check-circle-2');

	// Add a click event listener to the hider element
	button.addEventListener('click', async () => {
		const providerSettings =
			plugin.settings.aiProviderConfig[plugin.settings.aiProvider];

		const modelToCall =
			plugin.settings.customAiModel.length > 0
				? plugin.settings.customAiModel
				: providerSettings.model;

		if (!modelToCall || modelToCall.length === 0) {
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
			});

			if (!result || result.length === 0) {
				new Notice(`No result from ${plugin.settings.aiProvider}`);
				return;
			}

			new Notice('API is working properly');
		} catch (error) {
			let message = 'API is not working properly';

			if (error instanceof Error) {
				message += `: ${error.message}`;

				if (typeof error.cause === 'string') {
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
