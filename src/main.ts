import { Notice, Plugin, addIcon } from 'obsidian';

import { safeParseAsync } from 'valibot';
import manifest from '../manifest.json';
import { DEFAULT_SETTINGS } from './config';
import AiIcon from './icons/ai.svg';
import { getCommands } from './prompts';
import { runPrompt } from './run-prompt';
import { SettingTab } from './settings-tab';
import {
	type ObfuscatedPluginSettings,
	ObfuscatedPluginSettingsSchema,
	type PluginSettings,
} from './types';
import { log } from './utils/logging';
import { deobfuscateConfig, obfuscateConfig } from './utils/obfuscate-config';

export default class AiPlugin extends Plugin {
	settings: PluginSettings;

	async onload() {
		await this.loadSettings();

		addIcon('openai', AiIcon);

		for (const prompt of getCommands(this.settings)) {
			// slugify and remove spaces
			const iconName = prompt.name.toLowerCase().replaceAll(/\s/g, '-');

			// Add icon if it exists
			if (prompt.icon) addIcon(iconName, prompt.icon);

			this.addCommand({
				id: prompt.name,
				name: prompt.name,
				icon: prompt.icon ? iconName : AiIcon,
				editorCallback: async (editor) => {
					try {
						await runPrompt(this.app, editor, this.settings, prompt.name);
					} catch (error) {
						if (error instanceof Error) {
							log(this.settings, error.message);
						}
						new Notice('Error generating text.');
					}
				},
			});
		}

		this.registerEvent(
			this.app.workspace.on('editor-menu', (menu, editor) => {
				menu.addItem((item) => {
					item.setTitle(`${manifest.name} Commands`).setIcon('brain-cog');

					const subMenu = item.setSubmenu();

					for (const prompt of getCommands(this.settings)) {
						// slugify and remove spaces
						const iconName = prompt.name.toLowerCase().replaceAll(/\s/g, '-');

						// Add icon if it exists
						if (prompt.icon) addIcon(iconName, prompt.icon);
						subMenu.addItem((item) => {
							item
								.setTitle(prompt.name)
								.setIcon(prompt.icon ? iconName : AiIcon)
								.onClick(async () => {
									try {
										await runPrompt(
											this.app,
											editor,
											this.settings,
											prompt.name,
										);
									} catch (error) {
										if (error instanceof Error) {
											log(this.settings, error.message);
										}
										new Notice('Error generating text.');
									}
								});
						});
					}
				});
			}),
		);

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SettingTab(this.app, this));

		log(this.settings, 'Loaded plugin.');
	}

	onunload() {
		// This is called when the plugin is deactivated
	}

	async resetSettings() {
		this.settings = DEFAULT_SETTINGS;
		await this.saveSettings();
	}

	async loadSettings() {
		const localData: ObfuscatedPluginSettings = await this.loadData();

		const { success } = await safeParseAsync(
			ObfuscatedPluginSettingsSchema,
			localData,
		);

		if (!success) {
			this.settings = DEFAULT_SETTINGS;
			log(this.settings, 'Failed to parse settings, using defaults.');
			return;
		}

		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			deobfuscateConfig(localData),
		);
	}

	async saveSettings() {
		await this.saveData(obfuscateConfig(this.settings));
	}
}
