import WordWisePlugin from '@/main';
import { PluginSettings } from '@/types';
import { callTextAPI } from '@/utils/call-api';
import { log } from '@/utils/logging';
import { Notice, TextComponent, setIcon } from 'obsidian';

type Props = {
	text: TextComponent;
	plugin: WordWisePlugin;
	settings: PluginSettings;
};

// Function to create a new hider element
const createHiderElement = (text: TextComponent) => {
	// Insert a new button element before the text input element
	return text.inputEl.insertAdjacentElement(
		'beforebegin',
		document.createElement('button'),
	);
};

// Main function to wrap the password component
export const wrapAPITestComponent = ({ text, settings, plugin }: Props) => {
	// Create a new hider element
	const hider = createHiderElement(text);

	if (!hider) return;

	// Set the initial icon for the hider element
	setIcon(hider as HTMLElement, 'check-circle-2');

	// Add a click event listener to the hider element
	hider.addEventListener('click', async () => {
		try {
			const result = await callTextAPI({
				plugin,
				userMessage: 'Say word hello only.',
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
			new Notice('API is not working properly.');
		}
	});

	return text;
};
