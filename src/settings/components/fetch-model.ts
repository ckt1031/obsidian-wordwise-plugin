import { Notice, Setting } from 'obsidian';

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
import type { ForageStorage } from '@/utils/storage';

type Props = {
	containerEl: HTMLElement;
	plugin: WordWisePlugin;
	provider: string;
	forage: ForageStorage;
	onReload: () => void;
};

export const renderModelSetting = async ({
	containerEl,
	plugin,
	provider,
	forage,
	onReload,
}: Props) => {
	const { settings } = plugin;
	const providerConfig = settings.aiProviderConfig[provider];
	const { setModels } = forage;

	const isManualInput =
		providerConfig.manualModelInput || provider === APIProvider.AzureOpenAI;

	const setting = new Setting(containerEl).setName('Model');

	// 1. Add Toggle Manual/Dropdown Button (if not Azure)
	if (provider !== APIProvider.AzureOpenAI) {
		setting.addExtraButton((cb) => {
			cb.setIcon(isManualInput ? 'list' : 'pencil')
				.setTooltip(
					isManualInput ? 'Switch to dropdown' : 'Switch to manual input',
				)
				.onClick(async () => {
					providerConfig.manualModelInput = !isManualInput;
					await plugin.saveSettings();
					onReload();
				});
		});
	}

	// 2. Add Fetch Models Button (only if dropdown mode)
	if (!isManualInput) {
		setting.addExtraButton((cb) => {
			cb.setIcon('refresh-cw')
				.setTooltip('Fetch models')
				.onClick(async () => {
					try {
						cb.setDisabled(true);
						cb.setIcon('loader-2');

						let models: Models = [];

						const { baseUrl, apiKey } = providerConfig;
						const host = getAPIHost(
							baseUrl,
							provider in DEFAULT_HOST
								? DEFAULT_HOST[provider as keyof typeof DEFAULT_HOST]
								: '',
						);

						switch (provider) {
							case APIProvider.Cohere:
								models = await getCohereModels({ host, apiKey, provider });
								break;
							case APIProvider.GoogleGemini:
								models = await getGoogleGenAIModels({ host, apiKey, provider });
								break;
							case APIProvider.Anthropic:
								models = await getAnthropicModels({ host, apiKey, provider });
								break;
							case APIProvider.GitHub:
								models = await getGitHubModels({ host, apiKey, provider });
								break;
							case APIProvider.Mistral:
								models = await getMistralModels({ host, apiKey, provider });
								break;
							default:
								models = await getOpenAIModels({ host, apiKey, provider });
						}

						await setModels(provider, models);

						new Notice('Models updated successfully');
						onReload();
					} catch (error) {
						let message = 'Failed to fetch models';
						if (error instanceof Error) message += `: ${error.message}`;
						console.error(error);
						new Notice(message);
					} finally {
						cb.setDisabled(false);
						cb.setIcon('refresh-cw');
					}
				});
		});
	}

	// 3. Add the input component (Text or Dropdown)
	if (isManualInput) {
		setting.addText((text) =>
			text
				.setPlaceholder('Enter model ID')
				.setValue(providerConfig.model || '')
				.onChange(async (value) => {
					providerConfig.model = value;
					await plugin.saveSettings();
				}),
		);
	} else {
		const models = await forage.getModels(provider);
		setting.addDropdown((dropDown) => {
			for (const model of models) {
				if (typeof model === 'string') {
					dropDown.addOption(model, model);
				} else {
					dropDown.addOption(model.id, model.name || model.id);
				}
			}
			dropDown.setValue(providerConfig.model);
			dropDown.onChange(async (value) => {
				providerConfig.model = value;
				await plugin.saveSettings();
			});
		});
	}
};
