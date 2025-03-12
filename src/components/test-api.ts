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
		const { settings } = plugin;
		const providerSettings = settings.aiProviderConfig[settings.aiProvider];

		try {
			const result = await callTextAPI({
				allSettings: settings,
				providerSettings,

				baseURL: providerSettings.baseUrl,
				model: providerSettings.model,
				apiKey: providerSettings.apiKey,

				provider: settings.aiProvider,
				messages: {
					system: '',
					user: 'Say word hello only.',
				},
			});

			if (!result || result.length === 0) {
				new Notice(`No result from ${settings.aiProvider}`);
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
