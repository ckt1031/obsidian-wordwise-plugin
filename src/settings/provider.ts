import { type ButtonComponent, Notice, Setting } from 'obsidian';

import { nanoid } from 'nanoid';

import { APIProvider } from '../config';
import type { SettingsTab } from '.';
import { renderApiKeySetting } from './components/api-key';
import { renderModelSetting } from './components/fetch-model';

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

		renderApiKeySetting({ containerEl, plugin, provider });

		if (
			settings.advancedSettings ||
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

		renderModelSetting({
			containerEl,
			plugin,
			provider,
			forage,
			onReload: () => settingsTab.display(),
		});

		// Only when custom provider is selected
		if (settings.aiProviderConfig[settings.aiProvider].isCustom) {
			new Setting(containerEl).setName('Custom Endpoints').setHeading();

			new Setting(containerEl)
				.setName('API Path')
				.setDesc(
					'The path suffix for the API (e.g., /v1). Leave empty to use the default.',
				)
				.addText((text) =>
					text
						.setPlaceholder('/v1')
						.setValue(settings.aiProviderConfig[provider].chatPath || '')
						.onChange(async (value) => {
							settings.aiProviderConfig[provider].chatPath = value;
							await plugin.saveSettings();
						}),
				);
		}
	}
};
