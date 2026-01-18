import { Notice, Platform, Setting } from 'obsidian';

import TextGenerationLogModal from '../modals/generation-logs';
import {
	downloadFileWithFilePicker,
	saveFileToObsidianConfigFolder,
} from '../utils/download';
import type { SettingsTab } from '.';

export const renderLoggingSettings = (settingsTab: SettingsTab) => {
	const { containerEl, plugin, forage } = settingsTab;
	const { settings } = settingsTab.plugin;

	new Setting(containerEl).setName('Text Generation Logging').setHeading();

	new Setting(containerEl)
		.setName('Enable Logging')
		.setDesc('Save all generated text to a log.')
		.addToggle((toggle) =>
			toggle
				.setValue(settings.enableGenerationLogging)
				.onChange(async (value) => {
					settings.enableGenerationLogging = value;
					await plugin.saveSettings();
				}),
		);

	new Setting(containerEl)
		.setName('View Text Generation Logs')
		.setDesc('View all text generation logs with search and details.')
		.addButton((button) => {
			button.setButtonText('View Logs');
			button.onClick(async () => {
				const modal = new TextGenerationLogModal(plugin);
				await modal.initStates();
				modal.open();
			});
		});

	new Setting(containerEl)
		.setName('Import and Export Logs')
		.setDesc('Import or export your text generation logs.')
		.addButton((button) => {
			button.setButtonText('Import').onClick(async () => {
				const input = document.createElement('input');
				input.type = 'file';
				input.accept = 'application/json';
				input.onchange = async (event) => {
					const target = event.target as HTMLInputElement;
					const file = target.files?.[0];

					if (file) {
						const reader = new FileReader();
						reader.onload = async (e) => {
							const content = e.target?.result;
							if (typeof content === 'string') {
								const logs = JSON.parse(content);
								await forage.setTextGenerationLogs(logs);
								new Notice('Text generation logs imported successfully');
							}
						};
						reader.readAsText(file);
					}
				};
				input.click();
			});
		})
		.addButton((button) => {
			button.setButtonText('Export').onClick(async () => {
				const logs = await forage.getTextGenerationLogs();

				if (logs.length === 0) {
					new Notice('No text generation logs to export');
					return;
				}

				const blob = new Blob([JSON.stringify(logs)], {
					type: 'application/json',
				});

				const nowMS = Date.now();
				const vaultName = plugin.app.vault.getName();
				const fileName = Platform.isMobileApp
					? `logs-${nowMS}.json`
					: `${plugin.manifest.id}-logs-${vaultName}-${nowMS}.json`;

				if (!Platform.isMobileApp) {
					await downloadFileWithFilePicker(blob, fileName);
					return;
				}

				const file = await saveFileToObsidianConfigFolder(
					plugin,
					blob,
					fileName,
				);

				new Notice(`Saved to ${file}`);
			});
		});
};
