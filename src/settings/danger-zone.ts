import { Notice, Setting } from 'obsidian';

import ExportSettingsModal from '../modals/export-settings';
import ImportSettingsModal from '../modals/import-settings';
import type { SettingsTab } from '.';

export const renderDangerZoneSettings = (settingsTab: SettingsTab) => {
	const { containerEl, plugin } = settingsTab;
	const { settings } = settingsTab.plugin;

	new Setting(containerEl).setName('Danger Zone').setHeading();

	if (settings.advancedSettings) {
		new Setting(containerEl)
			.setName('Obfuscate Config')
			.setDesc(
				'Prevent API keys from being visible and tampered with. This might slow down the performance when loading settings.',
			)
			.addToggle((toggle) =>
				toggle.setValue(settings.obfuscateConfig).onChange(async (value) => {
					settings.obfuscateConfig = value;
					await plugin.saveSettings();
				}),
			);
	}

	new Setting(containerEl)
		.setName('Import and Export Settings')
		.setDesc('Import or export settings using text or URL.')
		.addButton((button) => {
			button.setButtonText('Import').onClick(async () => {
				new ImportSettingsModal(plugin).open();
			});
		})
		.addButton((button) => {
			button.setButtonText('Export').onClick(async () => {
				new ExportSettingsModal(plugin).open();
			});
		});

	new Setting(containerEl)
		.setName('Reset Settings')
		.setDesc('This will reset all settings to their original values.')
		.addButton((button) => {
			button.setTooltip('This cannot be undone! Be careful.');
			button.setButtonText('Reset').onClick(async () => {
				if (button.buttonEl.textContent === 'Reset') {
					// Are you sure? (seconds), give 5 seconds, loop 5 times
					for (let i = 0; i < 5; i++) {
						button.setButtonText(`Are you sure? (${5 - i})`);
						button.setDisabled(true);
						await sleep(1000);
					}

					button.setDisabled(false);
					button.setButtonText('Are you sure?');

					setTimeout(() => {
						button.setButtonText('Reset');
					}, 5000);
				} else {
					// This has already been clicked once, so reset the settings
					await plugin.resetSettings();
					new Notice('Resetting settings to default values');
					settingsTab.display(); // Refresh the settings tab
				}
			});
		});
};
