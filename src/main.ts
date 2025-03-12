import { Notice, Plugin, addIcon } from 'obsidian';

import localforage from 'localforage';
import { mergeDeepRight } from 'rambda';
import slugify from 'slugify';
import { safeParseAsync } from 'valibot';
import { getCommands } from './commands';
import { DEFAULT_SETTINGS } from './config';
import AiIcon from './icons/ai.svg';
import { moveConfig } from './migrations/localforage';
import TextGenerationLogModal from './modals/generation-logs';
import { ObfuscatedPluginSettingsSchema } from './schemas';
import { SettingTab } from './settings-tab';
import type { ObfuscatedPluginSettings, PluginSettings } from './types';
import type { EnhancedEditor } from './types';
import { runCommand } from './utils/handle-command';
import { deobfuscateConfig, obfuscateConfig } from './utils/obfuscate-config';
import SettingsExportImport from './utils/settings-sharing';

export default class WordWisePlugin extends Plugin {
	settings: PluginSettings;

	async onload() {
		await moveConfig(this);

		// Initialize localForage
		localforage.config({
			name: `${this.manifest.id}-${this.app.vault.getName()}`,
		});

		await this.loadSettings();

		addIcon('openai', AiIcon);

		const allCommands = await getCommands(this);

		for (const command of allCommands) {
			// slugify and remove spaces
			const iconName = command.name.toLowerCase().replaceAll(/\s/g, '-');

			// Add icon if it exists
			if (command.icon) addIcon(iconName, command.icon);

			this.addCommand({
				id: slugify(command.name),
				name: command.name,
				icon: command.icon ? iconName : AiIcon,
				editorCallback: (editor: EnhancedEditor) =>
					runCommand(editor, this, command.name),
			});
		}

		const commands = [
			{
				name: 'Check Text Generation Logs',
				onClick: async (_editor: EnhancedEditor) => {
					const modal = new TextGenerationLogModal(this);

					await modal.initStates();

					modal.open();
				},
			},
		];

		for (const command of commands) {
			this.addCommand({
				id: slugify(command.name),
				name: command.name,
				editorCallback: (editor: EnhancedEditor) => command.onClick(editor),
			});
		}

		this.registerEvent(
			this.app.workspace.on('editor-menu', (menu, editor: EnhancedEditor) => {
				menu.addItem((item) => {
					item.setTitle(`${this.manifest.name} Commands`).setIcon('brain-cog');

					const subMenu = item.setSubmenu();

					for (const command of allCommands) {
						// slugify and remove spaces
						const iconName = command.name.toLowerCase().replaceAll(/\s/g, '-');

						// Add icon if it exists
						if (command.icon) addIcon(iconName, command.icon);

						// Add command to sub-menu
						subMenu.addItem((item) => {
							item
								.setTitle(command.name)
								.setIcon(command.icon ? iconName : AiIcon)
								.onClick(() => runCommand(editor, this, command.name));
						});
					}
				});
			}),
		);

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SettingTab(this.app, this));

		this.registerObsidianProtocolHandler(
			this.manifest.id,
			async (inputParams) => {
				const settingsImport = new SettingsExportImport(this);
				const parsed = await settingsImport.importQrCodeUri(inputParams);
				if (parsed.status === 'error') {
					new Notice(parsed.message);
				} else if (parsed.result) {
					this.settings = mergeDeepRight(this.settings, parsed.result);
					await this.saveSettings();
					new Notice(
						'Settings imported. Please check the settings tab to verify.',
					);
				}
			},
		);

		console.info('Loaded WordWise Plugin');
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
			console.error('Failed to deobfuscate settings, using default settings.');
			return;
		}
		const parsedData = deobfuscateConfig(localData);

		if (parsedData === null) {
			this.settings = DEFAULT_SETTINGS;
			console.error('Failed to deobfuscate settings, using default settings.');
			return;
		}

		this.settings = mergeDeepRight(DEFAULT_SETTINGS, parsedData);

		// Merge providers
		this.settings.aiProviderConfig = mergeDeepRight(
			DEFAULT_SETTINGS.aiProviderConfig,
			this.settings.aiProviderConfig,
		);
	}

	async saveSettings() {
		await this.saveData(obfuscateConfig(this.settings));
	}
}
