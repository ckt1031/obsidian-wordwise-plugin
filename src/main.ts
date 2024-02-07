import { Notice, Plugin, addIcon } from 'obsidian';

import { safeParseAsync } from 'valibot';
import manifest from '../manifest.json';
import { DEFAULT_SETTINGS } from './config';
import AiIcon from './icons/ai.svg';
import { migrate20240205 } from './migration';
import { getCommands } from './prompts';
import { runCommand } from './run-command';
import { SettingTab } from './settings-tab';
import {
	type ObfuscatedPluginSettings,
	ObfuscatedPluginSettingsSchema,
	type PluginSettings,
} from './types';
import { log } from './utils/logging';
import { deobfuscateConfig, obfuscateConfig } from './utils/obfuscate-config';
import { importQrCodeUri } from './utils/settings-sharing';

export default class WordWisePlugin extends Plugin {
	settings: PluginSettings;

	async onload() {
		await this.loadSettings();

		addIcon('openai', AiIcon);

		for (const command of getCommands(this.settings)) {
			// slugify and remove spaces
			const iconName = command.name.toLowerCase().replaceAll(/\s/g, '-');

			// Add icon if it exists
			if (command.icon) addIcon(iconName, command.icon);

			this.addCommand({
				id: command.name,
				name: command.name,
				icon: command.icon ? iconName : AiIcon,
				editorCallback: (editor) =>
					runCommand(this.app, editor, this.settings, command.name),
			});
		}

		this.registerEvent(
			this.app.workspace.on('editor-menu', (menu, editor) => {
				menu.addItem((item) => {
					item.setTitle(`${manifest.name} Commands`).setIcon('brain-cog');

					const subMenu = item.setSubmenu();

					for (const command of getCommands(this.settings)) {
						// slugify and remove spaces
						const iconName = command.name.toLowerCase().replaceAll(/\s/g, '-');

						// Add icon if it exists
						if (command.icon) addIcon(iconName, command.icon);

						// Add command to sub-menu
						subMenu.addItem((item) => {
							item
								.setTitle(command.name)
								.setIcon(command.icon ? iconName : AiIcon)
								.onClick(() =>
									runCommand(this.app, editor, this.settings, command.name),
								);
						});
					}
				});
			}),
		);

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SettingTab(this.app, this));

		this.registerObsidianProtocolHandler(
			manifest.id,
			async (inputParams) => {
				const parsed = importQrCodeUri(
					inputParams,
					this.app.vault.getName()
				);
				if (parsed.status === "error") {
					new Notice(parsed.message);
				} else {
					this.settings = Object.assign({}, this.settings, await this.handleData(parsed.result));
					this.saveSettings();
					new Notice(
						"Settings imported. Please check the settings tab to verify."
					);
				}
			}
		);

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
			log(this.settings, 'Failed to parse settings, using default settings.');
			return;
		}
		const parsedData = deobfuscateConfig(localData);

		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.handleData(parsedData));
	}

	async handleData(data: unknown) {
		const newMigratedData = await migrate20240205(data);

		return newMigratedData;
	}

	async saveSettings() {
		await this.saveData(obfuscateConfig(this.settings));
	}
}
