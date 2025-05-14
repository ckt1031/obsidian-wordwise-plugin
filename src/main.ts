import {
	addIcon,
	Notice,
	Platform,
	Plugin,
	setIcon,
	setTooltip,
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

		this.registerEvent(
			this.app.vault.on(
				'modify',
				debounce(async (file) => {
					// Make sure the file is a markdown file
					if (!file.name.endsWith('.md')) return;

					this.prompts = await retrieveAllPrompts(this);
				}, 1000),
			),
		);

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

	async initializePromptsToCommands() {
		this.prompts = await retrieveAllPrompts(this);

		for (const prompt of this.prompts) {
			// slugify and remove spaces
			const iconName = prompt.name.toLowerCase().replaceAll(/\s/g, '-');

			// Add icon if it exists
			if (prompt.icon) addIcon(iconName, prompt.icon);

			this.addCommand({
				id: slugify(prompt.name),
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
				id: slugify(command.name),
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
