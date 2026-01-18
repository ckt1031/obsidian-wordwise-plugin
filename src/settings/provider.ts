import { type ButtonComponent, Notice, Setting } from 'obsidian';

import { nanoid } from 'nanoid';

import { wrapAPIKeyComponent } from '../components/api-key';
import { wrapFetchModelComponent } from '../components/fetch-model';
import { APIProvider } from '../config';
import type { SettingsTab } from '.';

export const renderProviderSettings = (settingsTab: SettingsTab) => {
	const { containerEl, plugin, forage } = settingsTab;
	const { settings } = plugin;

	new Setting(containerEl).setName('Provider').addDropdown((dropDown) => {
		// Add all the API Providers, use value as option value
		for (const [providerName, data] of Object.entries(
			settings.aiProviderConfig,
		)) {
			const display =
				data.isCustom && data.displayName && data.displayName.length > 0
					? `Custom: ${data.displayName}`
					: providerName;
			dropDown.addOption(providerName, display);
		}

		dropDown.setValue(settings.aiProvider);
		dropDown.onChange(async (value) => {
			settings.aiProvider = value as APIProvider;
			await plugin.saveSettings();
			settingsTab.display(); // Refresh the settings tab
		});
	});

	for (const provider of Object.keys(settings.aiProviderConfig)) {
		if (settings.aiProvider !== provider) {
			continue;
		}

		if (settings.aiProviderConfig[provider].isCustom) {
			const c = new Setting(containerEl);
			c.setName('Create New Custom Provider')
				.setDesc(
					"Create a provider with a different API endpoint.  Make sure it's compatible with OpenAI.",
				)
				.addButton((cb: ButtonComponent) => {
					cb.setButtonText('Create');
					cb.onClick(async () => {
						const newProvider = `Custom ${nanoid(4)}`;
						settings.aiProviderConfig[newProvider] = {
							model: '',
							apiKey: '',
							baseUrl: '',
							isCustom: true,
						};
						settings.aiProvider = newProvider;
						await plugin.saveSettings();
						settingsTab.display(); // Refresh the settings tab
					});
				});

			// Remove the custom provider, but the original custom provider cannot be removed
			if (provider !== APIProvider.Custom) {
				c.addButton((cb: ButtonComponent) => {
					cb.setButtonText('Remove');
					cb.onClick(async () => {
						if (cb.buttonEl.textContent === 'Remove') {
							// Are you sure? (seconds), give 5 seconds, loop 5 times
							for (let i = 0; i < 5; i++) {
								cb.setButtonText(`Sure? (${5 - i})`);
								cb.setDisabled(true);
								await sleep(1000);
							}

							cb.setDisabled(false);
							cb.setButtonText('Remove?');

							setTimeout(() => {
								cb.setButtonText('Remove');
							}, 5000);
						} else {
							delete settings.aiProviderConfig[provider];
							await forage.removeModels(provider);
							settings.aiProvider = APIProvider.OpenAI;
							await plugin.saveSettings();
							settingsTab.display(); // Refresh the settings tab
						}
					});
				});
			}

			new Setting(containerEl)
				.setName('Provider Display Name')
				.addText((text) =>
					text
						.setPlaceholder('Enter a name for this provider')
						.setValue(settings.aiProviderConfig[provider]?.displayName || '')
						.onChange(async (value) => {
							// Check if the display conflict with other display names or provider names
							const isConflict = Object.keys(APIProvider).some(
								(x) =>
									x === value ||
									settings.aiProviderConfig[x]?.displayName === value,
							);

							if (isConflict) {
								new Notice('Display name already exists');
								return;
							}

							settings.aiProviderConfig[provider].displayName = value;
							await plugin.saveSettings();
						}),
				);
		}

		const apiKeySetting = new Setting(containerEl);
		apiKeySetting.setName('API Key').addText((text) => {
			wrapAPIKeyComponent({ setting: apiKeySetting, text, plugin });

			text
				.setPlaceholder('Enter your API Key')
				.setValue(settings.aiProviderConfig[provider].apiKey)
				.onChange(async (value) => {
					// Update the API Key
					settings.aiProviderConfig[provider].apiKey = value;
					await plugin.saveSettings();
				});
		});

		if (
			settings.advancedSettings ||
			provider === APIProvider.AzureOpenAI ||
			// provider === APIProvider.Custom
			settings.aiProviderConfig[provider].isCustom
		) {
			new Setting(containerEl)
				.setName('API Base URL')
				.setDesc(
					'Enter the web address for the API. Do not include a trailing slash or any extra parts of the address.',
				)
				.addText((text) =>
					text
						.setPlaceholder('https://api.example.com') // No trailing slash in placeholder
						.setValue(settings.aiProviderConfig[provider].baseUrl)
						.onChange(async (value) => {
							// Update the Base URL
							settings.aiProviderConfig[provider].baseUrl = value;
							await plugin.saveSettings();
						}),
				);
		}

		if (provider === APIProvider.AzureOpenAI) {
			// API Version
			new Setting(containerEl).setName('API Version').addText((text) =>
				text
					.setPlaceholder('2023-05-15')
					.setValue(settings.aiProviderConfig[provider].apiVersion || '')
					.onChange(async (value) => {
						// Update the API Version
						settings.aiProviderConfig[provider].apiVersion = value;
						await plugin.saveSettings();
					}),
			);
		}

		const modelSetting = new Setting(containerEl);

		modelSetting.setName('Model');

		const providerConfig = settings.aiProviderConfig[provider];
		const isManualInput =
			providerConfig.manualModelInput || provider === APIProvider.AzureOpenAI;

		if (provider !== APIProvider.AzureOpenAI) {
			modelSetting.addExtraButton((cb) => {
				cb.setIcon(isManualInput ? 'list' : 'pencil')
					.setTooltip(
						isManualInput ? 'Switch to dropdown' : 'Switch to manual input',
					)
					.onClick(async () => {
						providerConfig.manualModelInput = !isManualInput;
						await plugin.saveSettings();
						settingsTab.display();
					});
			});
		}

		if (isManualInput) {
			// Set model as text input
			modelSetting.addText((text) =>
				text
					.setPlaceholder('Enter model ID')
					.setValue(providerConfig.model || '')
					.onChange(async (value) => {
						// Update the model
						providerConfig.model = value;
						await plugin.saveSettings();
					}),
			);
		} else {
			modelSetting.addDropdown(async (dropDown) => {
				const models = await forage.getModels(provider);

				// Find out the only select element in the containerEl
				const selectElement = modelSetting.settingEl.find(
					'select',
				) as HTMLSelectElement;

				wrapFetchModelComponent({
					dropDown,
					setting: modelSetting,
					plugin,
					onUpdateModels: (models) => {
						// Remove all options and fill it with the new models
						selectElement.innerHTML = '';

						// Add the new models to the dropdown
						for (const model of models) {
							selectElement.remove(models.indexOf(model));
						}

						for (const model of models) {
							if (typeof model === 'string') {
								dropDown.addOption(model, model);
							} else {
								dropDown.addOption(model.id, model.name || model.id);
							}
						}

						// Set the value to the current model
						dropDown.setValue(settings.aiProviderConfig[provider].model);
					},
				});

				for (const model of models) {
					if (typeof model === 'string') {
						dropDown.addOption(model, model);
					} else {
						dropDown.addOption(model.id, model.name || model.id);
					}
				}
				dropDown.setValue(settings.aiProviderConfig[provider].model);
				dropDown.onChange(async (value) => {
					// Update the Model
					settings.aiProviderConfig[provider].model = value;
					await plugin.saveSettings();
				});
			});
		}
	}
};
