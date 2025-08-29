import {
	addIcon,
	getIcon,
	Notice,
	Platform,
	Plugin,
	setIcon,
	setTooltip,
	type TAbstractFile,
} from 'obsidian';

import localforage from 'localforage';
import { merge } from 'rambda';
import { debounce } from 'rambdax';
import slugify from 'slugify';
import { safeParseAsync } from 'valibot';

import { DEFAULT_SETTINGS } from './config';
import TextGenerationLogModal from './modals/generation-logs';
import ViewLoadedPromptsModal from './modals/view-loaded-prompts';
import { retrieveAllPrompts } from './prompt';
import { ObfuscatedPluginSettingsSchema } from './schemas';
import { SettingsTab } from './settings-tab';
import type {
	EnhancedEditor,
	ObfuscatedPluginSettings,
	OutputInternalPromptProps,
	PluginSettings,
} from './types';
import {
	addBrainCogIcon,
	getFirstTextEmoji,
	isFirstTextEmoji,
	setLetterWithCog,
} from './utils/edit-svg';
import { runPrompt } from './utils/handle-command';
import { deobfuscateConfig, obfuscateConfig } from './utils/obfuscate-config';
import SettingsExportImport from './utils/settings-sharing';

export default class WordWisePlugin extends Plugin {
	settings: PluginSettings;
	prompts: OutputInternalPromptProps[];
	generationRequestAbortController: AbortController | null = null;

	private statusBarEl: HTMLElement | null = null;

	private iconSetCache = new Map<string, string>();

	// Generates and registers a custom icon in Obsidian's icon database.
	// Once registered, the icon can be used throughout the application.
	// We will cache the icon and the ID in order to know when to re-generate the icon.
	// @param iconNameOwner - The unique identifier/name for the icon
	// @param iconIDorIconContent - Optional existing icon ID or content to modify
	constructIcon(iconNameOwner: string, iconIDorIconContent?: string) {
		// If icon exists in Obsidian icon cache and the content is the same, return the name of the icon
		if (this.iconSetCache.get(iconNameOwner) === (iconIDorIconContent || ''))
			return iconNameOwner;

		// The icon is lucide icon.
		if (iconIDorIconContent && getIcon(iconIDorIconContent)) {
			const icon = getIcon(iconIDorIconContent);
			const brainCogIcon = addBrainCogIcon(icon);

			addIcon(iconNameOwner, brainCogIcon);
		} else {
			// The icon is not a lucide icon, we might use the first letter of the icon name to generate a custom icon.
			// If icon is not provided, we will use the icon name owner to generate a custom icon.
			// Get the first letter except "-" and " "
			let letter = (iconIDorIconContent || iconNameOwner)
				.replace(/-/g, '')
				.replace(/\s/g, '')
				.toUpperCase();

			if (isFirstTextEmoji(letter)) {
				letter = getFirstTextEmoji(letter);
			} else {
				letter = letter.charAt(0);
			}

			const icon = setLetterWithCog(letter);

			addIcon(iconNameOwner, icon);
		}

		// Cache the icon
		this.iconSetCache.set(iconNameOwner, iconIDorIconContent || '');

		return iconNameOwner;
	}

	onload() {
		this.registerEvent(
			this.app.workspace.on('editor-menu', (menu, editor: EnhancedEditor) => {
				menu.addItem((item) => {
					item.setTitle(`${this.manifest.name} prompts`).setIcon('brain-cog');

					const subMenu = item.setSubmenu();

					for (const prompt of this.prompts) {
						// slugify and remove spaces
						const iconName = prompt.name.toLowerCase().replaceAll(/\s/g, '-');

						// Add prompt to sub-menu
						subMenu.addItem((item) => {
							item
								.setTitle(prompt.name)
								.setIcon(this.constructIcon(iconName, prompt.icon))
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

		// Initialize localForage
		localforage.config({
			name: `${this.manifest.id}-${this.app.appId}`,
		});

		if (Platform.isDesktop) {
			// This will add a status bar element, only available for Desktop view
			this.statusBarEl = this.addStatusBarItem();

			// Load status bar
			this.updateStatusBar();
		}

		this.initializeConstantCommands();
		this.initializePromptsToCommands();
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

			// Check if the command already exists
			const commandId = `prompts-${slugify(prompt.name)}`;
			if (oldPluginCommands[commandId]) return;

			this.addCommand({
				// Prompts to mark it as a prompt command, to be identified in order to change later on.
				id: commandId,
				name: `Prompt - ${prompt.name}`,
				icon: this.constructIcon(iconName, prompt.icon),
				editorCallback: (editor: EnhancedEditor) =>
					runPrompt(editor, this, prompt.name),
			});
		}
	}

	initializeConstantCommands(): void {
		const obsidianCommands = [
			{
				name: 'View Text Generation Logs',
				icon: 'memory-stick',
				onClick: async (_editor: EnhancedEditor) => {
					const modal = new TextGenerationLogModal(this);
					await modal.initStates();
					modal.open();
				},
			},
			{
				name: 'View Loaded Prompts',
				icon: 'View-chevron-right',
				onClick: async (_editor: EnhancedEditor) => {
					new ViewLoadedPromptsModal(this).open();
				},
			},
		];

		for (const command of obsidianCommands) {
			this.addCommand({
				// Actions to mark it as a constant command
				id: `actions-${slugify(command.name)}`,
				name: command.name,
				icon: this.constructIcon(slugify(command.name), command.icon),
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
		// The data is either obfuscated or not, so we need to check for both
		let localData: ObfuscatedPluginSettings | PluginSettings =
			await this.loadData();

		// If the data is strictly an obfuscated settings, then we need to deobfuscate it
		const { success: isObfuscated } = await safeParseAsync(
			ObfuscatedPluginSettingsSchema,
			localData,
		);

		// 'z' in localData to be TypeScript happy
		if (isObfuscated && 'z' in localData) {
			localData = deobfuscateConfig(localData) ?? DEFAULT_SETTINGS;
		}

		this.settings = merge(DEFAULT_SETTINGS)(localData);

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
		let dataToSave: unknown = this.settings;

		if (this.settings.obfuscateConfig) {
			dataToSave = obfuscateConfig(this.settings);
		}

		await this.saveData(dataToSave);
	}
}
