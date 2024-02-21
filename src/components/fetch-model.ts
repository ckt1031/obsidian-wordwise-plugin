import { APIProvider, OPENROUTER_MODELS } from '@/config';
import WordWisePlugin from '@/main';
import { getOpenAIModels } from '@/provider/openai';
import { log } from '@/utils/logging';
import { setOpenRouterForage } from '@/utils/storage';
import { DropdownComponent, Notice, setIcon } from 'obsidian';

type Props = {
	dropDown: DropdownComponent;
	plugin: WordWisePlugin;
};

// Main function to wrap the password component
export const wrapFetchModelComponent = ({ dropDown, plugin }: Props) => {
	// Create a new hider element
	const fetchButton = dropDown.selectEl.insertAdjacentElement(
		'beforebegin',
		document.createElement('button'),
	);

	const resetButton = dropDown.selectEl.insertAdjacentElement(
		'beforebegin',
		document.createElement('button'),
	);

	if (!fetchButton || !resetButton) return;

	// Set the initial icon for the hider element
	setIcon(fetchButton as HTMLElement, 'list-restart');
	setIcon(resetButton as HTMLElement, 'list-x');

	resetButton.addEventListener('click', async () => {
		switch (plugin.settings.aiProvider) {
			case APIProvider.OpenRouter: {
				await setOpenRouterForage(OPENROUTER_MODELS);
				break;
			}
			default:
				throw new Error(`Unknown API Provider: ${plugin.settings.aiProvider}`);
		}
		new Notice('Models reset successfully, please refresh the plugin.');
	});

	// Add a click event listener to the hider element
	fetchButton.addEventListener('click', async () => {
		try {
			let models = [];

			const { settings } = plugin;

			switch (settings.aiProvider) {
				case APIProvider.OpenRouter: {
					models = await getOpenAIModels({ plugin });
					break;
				}
				default:
					throw new Error(`Unknown API Provider: ${settings.aiProvider}`);
			}

			await setOpenRouterForage(models);

			log(plugin, models);

			new Notice(
				'Models fetched and stored successfully, please refresh the plugin.',
			);
		} catch (error) {
			log(plugin, error);
			new Notice('Failed to fetch models.');
		}
	});

	return dropDown;
};
