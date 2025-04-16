import { Notice, Plugin, addIcon, setIcon, setTooltip } from 'obsidian';

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

	private statusBarEl: HTMLElement | null = null;
	generationRequestAbortController: AbortController | null = null;

	async onload() {
		await moveConfig(this);

		// This will add a settings tab, only available for Desktop app
		this.statusBarEl = this.addStatusBarItem();

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
				console.log(inputParams);
				const settingsImport = new SettingsExportImport(this);
				settingsImport.importEncodedData(inputParams.data);
			},
		);

		// Load status bar
		this.updateStatusBar();

		console.info('Loaded WordWise Plugin');
	}

	onunload() {
		// This is called when the plugin is deactivated
	}

	updateStatusBar(): void {
		if (!this.statusBarEl) return;

		// Clear the status bar element
		this.statusBarEl.empty();

		if (this.generationRequestAbortController) {
			const idleStatusBar = createEl('span');
			setTooltip(idleStatusBar, 'Ckick to stop Wordwise generation', {
				placement: 'top',
			});
			setIcon(idleStatusBar, 'loader');
			idleStatusBar.onclick = () => {
				this.generationRequestAbortController?.abort();
				this.generationRequestAbortController = null;
				this.updateStatusBar();
			};

			this.statusBarEl.appendChild(idleStatusBar);
		} else {
			const idleStatusBar = createEl('span');
			setTooltip(idleStatusBar, 'WordWise Ready', { placement: 'top' });
			setIcon(idleStatusBar, 'brain-cog');

			const onPress = () => {
				new Notice('WordWise is ready');
			};

			idleStatusBar.onclick = onPress;

			this.statusBarEl.appendChild(idleStatusBar);
		}
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
