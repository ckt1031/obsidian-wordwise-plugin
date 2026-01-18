import {
	type DropdownComponent,
	Notice,
	type Setting,
	setIcon,
	setTooltip,
} from 'obsidian';

import { APIProvider, DEFAULT_HOST } from '@/config';
import type WordWisePlugin from '@/main';
import { getAnthropicModels } from '@/provider/anthropic';
import { getCohereModels } from '@/provider/cohere';
import { getGitHubModels } from '@/provider/github';
import { getGoogleGenAIModels } from '@/provider/google-ai';
import { getMistralModels } from '@/provider/mistral';
import { getOpenAIModels } from '@/provider/openai';
import type { Models } from '@/types';
import { getAPIHost } from '@/utils/get-url-host';
import { ForageStorage } from '@/utils/storage';

type Props = {
	setting: Setting;
	dropDown: DropdownComponent;
	plugin: WordWisePlugin;
	onUpdateModels: (models: Models) => void;
};

export const wrapFetchModelComponent = ({
	setting,
	dropDown,
	plugin,
	onUpdateModels,
}: Props) => {
	// Create a container for the buttons
	const buttonContainer = document.createElement('div');
	buttonContainer.className = 'settings-button-row';

	setting.controlEl.className = 'settings-input-wrapper';

	const fetchButton = document.createElement('button') as HTMLButtonElement;

	// Append buttons to the container
	buttonContainer.appendChild(fetchButton);

	// Insert the container before the dropdown
	dropDown.selectEl.insertAdjacentElement('beforebegin', buttonContainer);

	// Add icon and tooltip
	setIcon(fetchButton, 'refresh-cw');
	setTooltip(fetchButton, 'Fetch models');

	const { setModels } = new ForageStorage();

	// Add a click event listener to the hider element
	fetchButton.addEventListener('click', async () => {
		try {
			let models = [];

			const { settings } = plugin;

			const { baseUrl, apiKey } =
				settings.aiProviderConfig[settings.aiProvider];
			const host = getAPIHost(
				baseUrl,
				settings.aiProvider in DEFAULT_HOST
					? DEFAULT_HOST[settings.aiProvider as keyof typeof DEFAULT_HOST]
					: '',
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
				case APIProvider.GitHub:
					models = await getGitHubModels({
						host,
						apiKey,
						provider: settings.aiProvider,
					});
					break;
				case APIProvider.Mistral:
					models = await getMistralModels({
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

			// Fire the onUpdateModels callback if provided
			onUpdateModels(models);

			await setModels(settings.aiProvider, models);

			new Notice('Models updated successfully');
		} catch (error) {
			let message = 'Failed to fetch models';

			if (error instanceof Error) {
				message += `: ${error.message}`;
			}

			// Log the error to the console
			console.error(error);

			new Notice(message);
		}
	});

	return dropDown;
};
