import {
	addIcon,
	Notice,
	Platform,
	Plugin,
	setIcon,
	setTooltip,
	TAbstractFile,
} from 'obsidian';

import localforage from 'localforage';
import { merge } from 'rambda';
import { debounce } from 'rambdax';
import slugify from 'slugify';
import { safeParseAsync } from 'valibot';

import { DEFAULT_SETTINGS } from './config';
import AiIcon from './icons/ai.svg';
import { upgradeLocalForageInstance } from './migrations/localforage';
import TextGenerationLogModal from './modals/generation-logs';
import { retrieveAllPrompts } from './prompt';
import { ObfuscatedPluginSettingsSchema } from './schemas';
import { SettingsTab } from './settings-tab';
import type {
	EnhancedEditor,
	ObfuscatedPluginSettings,
	OutputInternalPromptProps,
	PluginSettings,
} from './types';
import { runPrompt } from './utils/handle-command';
import { deobfuscateConfig, obfuscateConfig } from './utils/obfuscate-config';
import SettingsExportImport from './utils/settings-sharing';

export default class WordWisePlugin extends Plugin {
	settings: PluginSettings;
	prompts: OutputInternalPromptProps[];
	generationRequestAbortController: AbortController | null = null;

	private statusBarEl: HTMLElement | null = null;

	onload() {
		this.registerEvent(
			this.app.workspace.on('editor-menu', (menu, editor: EnhancedEditor) => {
				menu.addItem((item) => {
					item.setTitle(`${this.manifest.name} prompts`).setIcon('brain-cog');

					const subMenu = item.setSubmenu();

					for (const prompt of this.prompts) {
						// slugify and remove spaces
						const iconName = prompt.name.toLowerCase().replaceAll(/\s/g, '-');

						// Add icon if it exists
						if (prompt.icon) addIcon(iconName, prompt.icon);

						// Add prompt to sub-menu
						subMenu.addItem((item) => {
							item
								.setTitle(prompt.name)
								.setIcon(prompt.icon ? iconName : AiIcon)
								.onClick(() => runPrompt(editor, this, prompt.name));
						});
					}
				});
			}),
		);

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SettingsTab(this));

		this.registerObsidianProtocolHandler(
			this.manifest.id,
			async (inputParams) => {
				const settingsImport = new SettingsExportImport(this);
				settingsImport.importEncodedData(inputParams.data);
			},
		);

		const updateFromFile = async (file: TAbstractFile) => {
			// Make sure the file is a markdown file
			if (!file.name.endsWith('.md')) return;

			this.prompts = await retrieveAllPrompts(this);
			await this.initializePromptsToCommands();
		};

		this.registerEvent(
			// Reduce CPU usage by debouncing the event
			this.app.vault.on('modify', debounce(updateFromFile, 1000)),
		);

		// Delete event is immediate and does not need debouncing
		this.registerEvent(this.app.vault.on('delete', updateFromFile));

		this.app.workspace.onLayoutReady(() => this.initializePlugin());

		console.info('Loaded WordWise Plugin');
	}

	// Initialize things up when layout is ready to optimize startup time
	async initializePlugin(): Promise<void> {
		// Load settings to memory, ensuring the plugin is ready to go
		await this.loadSettings();

		// Add icon
		addIcon('openai', AiIcon);

		// Migrate localForage instance from previous versions
		await upgradeLocalForageInstance(this);

		// Initialize localForage
		localforage.config({
			name: `${this.manifest.id}-${this.app.appId}`,
		});

		this.initializeConstantCommands();
		this.initializePromptsToCommands();

		if (Platform.isDesktop) {
			// This will add a status bar element, only available for Desktop view
			this.statusBarEl = this.addStatusBarItem();

			// Load status bar
			this.updateStatusBar();
		}
	}

	async initializePromptsToCommands(prompts?: OutputInternalPromptProps[]) {
		this.prompts = prompts ?? (await retrieveAllPrompts(this));

		const oldPluginCommands = this.app.commands.commands;

		// this.prompts is always the latest prompts, and it's updated on file change
		// commands is old one, we will need to add all on plguin load or remove if not found in this.prompts
		// so we need to compare the two and add or remove commands accordingly

		// Get all commands that are not in this.prompts
		const commandsToRemove = Object.keys(oldPluginCommands).filter(
			(pluginCommand) =>
				!this.prompts.some(
					(prompt) =>
						slugify(prompt.name) ===
						pluginCommand.replace(`${this.manifest.id}:prompts-`, ''),
				) && pluginCommand.startsWith(`${this.manifest.id}:prompts-`),
		);

		// Remove commands that are not in this.prompts
		for (const command of commandsToRemove) {
			this.removeCommand(command.replace(`${this.manifest.id}:`, ''));
		}

		for (const prompt of this.prompts) {
			// slugify and remove spaces
			const iconName = prompt.name.toLowerCase().replaceAll(/\s/g, '-');

			// Add icon if it exists
			if (prompt.icon) addIcon(iconName, prompt.icon);

			// Check if the command already exists
			const commandId = `prompts-${slugify(prompt.name)}`;
			if (oldPluginCommands[commandId]) return;

			this.addCommand({
				// Prompts to mark it as a prompt command, to be identified in order to change later on.
				id: commandId,
				name: prompt.name,
				icon: prompt.icon ? iconName : AiIcon,
				editorCallback: (editor: EnhancedEditor) =>
					runPrompt(editor, this, prompt.name),
			});
		}
	}

	initializeConstantCommands(): void {
		const obsidianCommands = [
			{
				name: 'Check Text Generation Logs',
				onClick: async (_editor: EnhancedEditor) => {
					const modal = new TextGenerationLogModal(this);

					await modal.initStates();

					modal.open();
				},
			},
		];

		for (const command of obsidianCommands) {
			this.addCommand({
				// Actions to mark it as a constant command
				id: `actions-${slugify(command.name)}`,
				name: command.name,
				editorCallback: (editor: EnhancedEditor) => command.onClick(editor),
			});
		}
	}

	onunload() {
		// Abort all generation requests
		this.generationRequestAbortController?.abort();

		// Clear off memory
		this.prompts = [];
	}

	updateStatusBar(): void {
		// Check if the status bar element is available and if the status bar is enabled
		if (!this.statusBarEl || !this.settings.enableStatusBarButton) return;

		// Check if the platform is desktop
		if (!Platform.isDesktop) return;

		// Clear the status bar element
		this.statusBarEl.empty();

		this.statusBarEl.addClass('mod-clickable');

		const button = createEl('span', {
			cls: ['status-bar-item-icon'],
		});

		if (this.generationRequestAbortController) {
			setIcon(button, 'loader');
			setTooltip(button, 'Ckick to stop Wordwise generation', {
				placement: 'top',
			});

			button.onclick = () => {
				this.generationRequestAbortController?.abort();
				this.generationRequestAbortController = null;
				this.updateStatusBar();
			};

			this.statusBarEl.appendChild(button);

			return;
		}

		setIcon(button, 'brain-cog');
		setTooltip(button, 'WordWise Ready', { placement: 'top' });

		button.onclick = () => new Notice('WordWise is ready');

		this.statusBarEl.appendChild(button);
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

		this.settings = merge(DEFAULT_SETTINGS)(parsedData);

		/**
		 * Merge providers when there is new native supported provider
		 * This merge the EXISTING provider settings INTO the new provider settings
		 * And save it back to the settings
		 */
		this.settings.aiProviderConfig = merge(DEFAULT_SETTINGS.aiProviderConfig)(
			this.settings.aiProviderConfig,
		);
	}

	async saveSettings() {
		await this.saveData(obfuscateConfig(this.settings));
	}
}
