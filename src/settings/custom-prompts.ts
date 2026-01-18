import { type ButtonComponent, Notice, Setting } from 'obsidian';

import { debounce } from 'rambdax';

import AddCustomPromptModal from '../modals/add-custom-prompt';
import stringToFragment from '../utils/string-fragment';
import type { SettingsTab } from '.';

export const renderCustomPromptSettings = (settingsTab: SettingsTab) => {
	const { containerEl, plugin } = settingsTab;
	const { settings } = plugin;

	new Setting(containerEl).setName('Custom Prompts').setHeading();

	new Setting(containerEl)
		.setDesc(
			'This is a list of your custom instructions. You can edit, delete, or add new ones.',
		)
		.addButton((cb: ButtonComponent) => {
			cb.setTooltip('Add a new custom prompt');
			cb.setButtonText('Add');
			cb.onClick(async () => {
				await plugin.app.setting.close();
				new AddCustomPromptModal(plugin, false).open();
			});
		});

	for (const prompts of settings.customPrompts) {
		const index = settings.customPrompts.indexOf(prompts);
		new Setting(containerEl)
			.setName(`${index + 1}: ${prompts.name}`)
			.setDesc(
				prompts.data.length > 100
					? `${prompts.data.slice(0, 100)}...`
					: prompts.data,
			)
			.addButton((button) => {
				button.setIcon('pencil');
				button.setTooltip('Edit this prompt');
				button.onClick(async () => {
					const prompt = settings.customPrompts.find(
						(x) => x.name === prompts.name,
					);

					if (!prompt) return;

					await plugin.app.setting.close();
					new AddCustomPromptModal(plugin, true, prompts).open();
				});
			})
			.addButton((button) => {
				button.setIcon('cross');
				button.setTooltip('Delete this prompt');
				button.onClick(async () => {
					if (button.buttonEl.textContent === '') {
						// Are you sure? (seconds), give 5 seconds, loop 5 times
						for (let i = 0; i < 5; i++) {
							button.setButtonText(`Are you sure to delete? (${5 - i})`);
							button.setDisabled(true);
							await sleep(1000);
						}

						button.setDisabled(false);
						button.setButtonText('Are you sure to delete?');

						setTimeout(() => {
							button.setIcon('cross');
						}, 5000);
					} else {
						if (button.buttonEl.parentElement?.parentElement) {
							button.buttonEl.parentElement.parentElement.remove();
						}
						settings.customPrompts = settings.customPrompts.filter(
							(p) => p.name !== prompts.name,
						);
						await plugin.saveSettings();
						settingsTab.display(); // Refresh the settings tab
					}
				});
			});
	}

	new Setting(containerEl)
		.setName('File Prompts')
		.setDesc(
			stringToFragment(
				'Use instructions from files in a specific folder, check <a href="https://github.com/ckt1031/obsidian-wordwise-plugin/wiki/File-Based-Prompts">wiki</a> for more details.',
			),
		)
		.addToggle((toggle) =>
			toggle
				.setValue(settings.customPromptsFromFolder.enabled)
				.onChange(async (value) => {
					settings.customPromptsFromFolder.enabled = value;
					await plugin.saveSettings();
					settingsTab.display(); // Refresh the settings tab
				}),
		);

	if (settings.customPromptsFromFolder.enabled) {
		new Setting(containerEl)
			.setName('Folder Path')
			.setDesc('The folder where your prompt files are located.')
			.addText((text) =>
				text
					.setPlaceholder('Enter the folder path')
					.setValue(settings.customPromptsFromFolder.path)
					.onChange(
						debounce(async (value: string) => {
							const folder = plugin.app.vault.getFolderByPath(value);
							if (!folder) new Notice(`Folder (${value}) does not exist`);

							settings.customPromptsFromFolder.path = value;
							await plugin.saveSettings();
						}, 1500),
					),
			);
	}
};
