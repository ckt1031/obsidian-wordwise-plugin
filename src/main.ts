import { addIcon, Notice, Plugin } from 'obsidian';

import { runPrompts } from './generate';
import { log } from './logging';
import { deobfuscateConfig, obfuscateConfig } from './obfuscate-config';
import { PROMPTS } from './prompts';
import { SettingTab } from './settings-tab';
import {
	type ObfuscatedPluginSettings,
	ObfuscatedPluginSettingsSchema,
	type PluginSettings,
} from './types';

const DEFAULT_SETTINGS: PluginSettings = {
	openAiApiKey: '',
	openAiBaseUrl: 'https://api.openai.com',
	openAiModel: 'gpt-3.5-turbo',
	maxTokens: 2000,
	temperature: 0.5,
	presencePenalty: 0,
	frequencyPenalty: 0,
	debugMode: false,
};

export default class AiPlugin extends Plugin {
	settings: PluginSettings;

	async onload() {
		await this.loadSettings();

		addIcon(
			'openai',
			'<svg xmlns="http://www.w3.org/2000/svg" width="800px" height="800px" viewBox="0 0 512 512" id="icons"><path d="M259.92,262.91,216.4,149.77a9,9,0,0,0-16.8,0L156.08,262.91a9,9,0,0,1-5.17,5.17L37.77,311.6a9,9,0,0,0,0,16.8l113.14,43.52a9,9,0,0,1,5.17,5.17L199.6,490.23a9,9,0,0,0,16.8,0l43.52-113.14a9,9,0,0,1,5.17-5.17L378.23,328.4a9,9,0,0,0,0-16.8L265.09,268.08A9,9,0,0,1,259.92,262.91Z" fill="none" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"/><polygon points="108 68 88 16 68 68 16 88 68 108 88 160 108 108 160 88 108 68" fill="none" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"/><polygon points="426.67 117.33 400 48 373.33 117.33 304 144 373.33 170.67 400 240 426.67 170.67 496 144 426.67 117.33" fill="none" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"/></svg>',
		);

		for (const prompt of PROMPTS) {
			this.addCommand({
				id: prompt.name,
				name: prompt.name,
				icon: 'openai',
				editorCallback: async editor => {
					try {
						await runPrompts(editor, this.settings, prompt.name);
						new Notice('Text generated.');
					} catch (error) {
						if (error instanceof Error) {
							log(this.settings, error.message);
						}
						new Notice('Error generating text.');
					}
				},
			});
		}

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SettingTab(this.app, this));

		log(this.settings, 'Loaded plugin.');
	}

	onunload() {
		// This is called when the plugin is deactivated
	}

	async loadSettings() {
		const localData: ObfuscatedPluginSettings = await this.loadData();

		const { success } = await ObfuscatedPluginSettingsSchema.safeParseAsync(localData);

		if (!success) {
			this.settings = DEFAULT_SETTINGS;
			console.log('Failed to parse settings, using defaults.');
			return;
		}

		this.settings = Object.assign({}, DEFAULT_SETTINGS, deobfuscateConfig(localData));
	}

	async saveSettings() {
		await this.saveData(obfuscateConfig(this.settings));
	}
}
