import { addIcon, Plugin } from 'obsidian';

import { runPrompts } from './generate';
import { log } from './logging';
import { PROMPTS } from './prompts';
import { SettingTab } from './settings-tab';
import type { PluginSettings } from './types';

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
			`<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-brand-openai" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
    <path d="M11.217 19.384a3.501 3.501 0 0 0 6.783 -1.217v-5.167l-6 -3.35"></path>
    <path d="M5.214 15.014a3.501 3.501 0 0 0 4.446 5.266l4.34 -2.534v-6.946"></path>
    <path d="M6 7.63c-1.391 -.236 -2.787 .395 -3.534 1.689a3.474 3.474 0 0 0 1.271 4.745l4.263 2.514l6 -3.348"></path>
    <path d="M12.783 4.616a3.501 3.501 0 0 0 -6.783 1.217v5.067l6 3.45"></path>
    <path d="M18.786 8.986a3.501 3.501 0 0 0 -4.446 -5.266l-4.34 2.534v6.946"></path>
    <path d="M18 16.302c1.391 .236 2.787 -.395 3.534 -1.689a3.474 3.474 0 0 0 -1.271 -4.745l-4.308 -2.514l-5.955 3.42"></path>
 </svg>`,
		);

		for (const prompt of PROMPTS) {
			this.addCommand({
				id: prompt.name,
				name: prompt.name,
				icon: 'openai',
				editorCallback: async editor => {
					await runPrompts(editor, this.settings, prompt.name);
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
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
