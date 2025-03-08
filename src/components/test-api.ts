import type WordWisePlugin from '@/main';
import { callTextAPI } from '@/utils/call-api';
import { log } from '@/utils/logging';
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

		try {
			const providerSettings = settings.aiProviderConfig[settings.aiProvider];
			const result = await callTextAPI({
				allSettings: settings,
				providerSettings,

				host: providerSettings.baseUrl,
				model: providerSettings.model,
				apiKey: providerSettings.apiKey,

				provider: settings.aiProvider,
				messages: {
					system: '',
					user: 'Say word hello only.',
				},
			});

			log(plugin, result);

			if (result && result.length > 0) {
				const provider = settings.aiProvider;
				const providerSettings = settings.aiProviderConfig[provider];
				const model =
					settings.customAiModel.length > 0
						? settings.customAiModel
						: providerSettings.model;
				new Notice(`${provider} API is working properly with model ${model}`);
			}
		} catch (error) {
			log(plugin, error);
			let message = 'API is not working properly';

			if (error instanceof Error) {
				message += `: ${error.message}`;
			}

			new Notice(message);
		}
	});

	return text;
};
