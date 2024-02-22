import { APIProvider, OPENROUTER_MODELS } from '@/config';
import WordWisePlugin from '@/main';
import ConfirmModal from '@/modals/confirm';
import { getOpenAIModels } from '@/provider/openai';
import { log } from '@/utils/logging';
import { setModelsForage } from '@/utils/storage';
import { DropdownComponent, Notice, setIcon, setTooltip } from 'obsidian';

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

	setTooltip(fetchButton as HTMLElement, 'Fetch models');
	setTooltip(resetButton as HTMLElement, 'Reset models (use with caution)');

	resetButton.addEventListener('click', async () => {
		const confirm = new ConfirmModal(plugin.app);

		const result = await confirm.promise;

		if (!result) return;

		switch (plugin.settings.aiProvider) {
			case APIProvider.OpenRouter: {
				await setModelsForage(APIProvider.OpenRouter, OPENROUTER_MODELS);
				break;
			}
			case APIProvider.Custom: {
				await setModelsForage(APIProvider.Custom, []);
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
				case APIProvider.Custom:
					models = await getOpenAIModels({ plugin });
					break;
				default:
					throw new Error(`Unknown API Provider: ${settings.aiProvider}`);
			}

			await setModelsForage(settings.aiProvider, models);

			log(plugin, models);

			new Notice(
				'Models fetched and stored successfully, please refresh the plugin.',
			);
		} catch (error) {
			log(plugin, error);
			let message = 'Failed to fetch models';

			if (error instanceof Error) {
				message += `: ${error.message}`;
			}

			new Notice(message);
		}
	});

	return dropDown;
};
