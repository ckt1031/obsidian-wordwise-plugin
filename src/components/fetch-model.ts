import { APIProvider, DEFAULT_HOST } from '@/config';
import type WordWisePlugin from '@/main';
import ConfirmModal from '@/modals/confirm';
import { getAnthropicModels } from '@/provider/anthropic';
import { getCohereModels } from '@/provider/cohere';
import { getGoogleGenAIModels } from '@/provider/google-ai';
import { getOpenAIModels } from '@/provider/openai';
import { getAPIHost } from '@/utils/get-url-host';
import { log } from '@/utils/logging';
import { ForageStorage } from '@/utils/storage';
import { type DropdownComponent, Notice, setIcon, setTooltip } from 'obsidian';

type Props = {
	dropDown: DropdownComponent;
	plugin: WordWisePlugin;
};

export const wrapFetchModelComponent = ({ dropDown, plugin }: Props) => {
	const fetchButton = dropDown.selectEl.insertAdjacentElement(
		'beforebegin',
		document.createElement('button'),
	) as HTMLElement;

	const resetButton = dropDown.selectEl.insertAdjacentElement(
		'beforebegin',
		document.createElement('button'),
	) as HTMLElement;

	if (!fetchButton || !resetButton) return;

	// Set the initial icon for the hider element
	setIcon(fetchButton, 'list-restart');
	setIcon(resetButton, 'list-x');

	setTooltip(fetchButton, 'Fetch models');
	setTooltip(resetButton, 'Reset models (use with caution)');

	const { setModels } = new ForageStorage();

	resetButton.addEventListener('click', async () => {
		const confirmModal = new ConfirmModal(plugin);

		confirmModal.open();

		const result = await confirmModal.promise;

		if (!result) return;

		if (plugin.settings.aiProvider === APIProvider.OpenRouter) {
			await setModels(APIProvider.OpenRouter, []);
		} else {
			await setModels(plugin.settings.aiProvider, []);
		}

		new Notice('Models reset successfully, please refresh the plugin.');
	});

	// Add a click event listener to the hider element
	fetchButton.addEventListener('click', async () => {
		try {
			let models = [];

			const { settings } = plugin;

			const { baseUrl, apiKey } =
				settings.aiProviderConfig[settings.aiProvider];
			const host = getAPIHost(
				baseUrl,
				settings.aiProvider in DEFAULT_HOST ? settings.aiProvider : '',
			);

			switch (settings.aiProvider) {
				case APIProvider.Cohere: {
					models = await getCohereModels({
						host,
						apiKey,
						provider: settings.aiProvider,
					});
					break;
				}
				case APIProvider.GoogleGemini: {
					models = await getGoogleGenAIModels({
						host,
						apiKey,
						provider: settings.aiProvider,
					});
					break;
				}
				case APIProvider.Anthropic:
					models = await getAnthropicModels({
						host,
						apiKey,
						provider: settings.aiProvider,
					});
					break;
				default:
					models = await getOpenAIModels({
						host,
						apiKey,
						provider: settings.aiProvider,
					});
			}

			await setModels(settings.aiProvider, models);

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
