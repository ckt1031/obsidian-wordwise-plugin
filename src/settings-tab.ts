/* eslint-disable unicorn/no-zero-fractions */
import type { App } from 'obsidian';
import { PluginSettingTab, Setting } from 'obsidian';

import type AiPlugin from './main';

export class SettingTab extends PluginSettingTab {
	plugin: AiPlugin;

	constructor(app: App, plugin: AiPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	private static createFragmentWithHTML = (html: string) =>
		createFragment(documentFragment => (documentFragment.createDiv().innerHTML = html));

	display(): void {
		const { containerEl, plugin } = this;

		containerEl.empty();
		containerEl.createEl('h2', { text: 'General Configurations:' });

		new Setting(containerEl)
			.setName('API Key')
			.setDesc('API Key for the OpenAI API')
			.addText(text =>
				text
					.setPlaceholder('Enter your API Key')
					.setValue(plugin.settings.openAiApiKey)
					.onChange(async value => {
						plugin.settings.openAiApiKey = value;
						await plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName('OpenAI Endpoint Base URL')
			.setDesc(
				SettingTab.createFragmentWithHTML(
					'Base URL for the OpenAI API, defaults to <a href="https://api.openai.com">https://api.openai.com</a>, DO NOT include / trailing slash and /v1 suffix',
				),
			)
			.addText(text =>
				text
					.setPlaceholder('Enter the base URL')
					.setValue(plugin.settings.openAiBaseUrl)
					.onChange(async value => {
						plugin.settings.openAiBaseUrl = value;
						await plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName('OpenAI Model')
			.setDesc(
				SettingTab.createFragmentWithHTML(
					'OpenAI Model to use, defaults to <b>gpt-3.5-turbo</b>, see <a href="https://platform.openai.com/docs/models">OpenAI Models</a> for more info',
				),
			)
			.addText(text =>
				text
					.setPlaceholder('Enter the model name')
					.setValue(plugin.settings.openAiModel)
					.onChange(async value => {
						plugin.settings.openAiModel = value;
						await plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName('Temperature')
			.setDesc(
				SettingTab.createFragmentWithHTML(
					'Temperature for the model, defaults to <b>0.5</b>, see <a href="https://platform.openai.com/docs/api-reference/completions/create">OpenAI Reference</a> for more info',
				),
			)
			.addText(text =>
				text.setValue(plugin.settings.temperature.toString()).onChange(async value => {
					plugin.settings.temperature = Number.parseFloat(value);
					await plugin.saveSettings();
				}),
			);

		new Setting(containerEl)
			.setName('Presence Penalty')
			.setDesc(
				SettingTab.createFragmentWithHTML(
					"Presence penalty for the model, increasing the model's likelihood to talk about new topics, defaults to <b>0.0</b>.",
				),
			)
			.addText(text =>
				text.setValue(plugin.settings.presencePenalty.toString()).onChange(async value => {
					let numValue = Number.parseFloat(value);
					if (numValue < -2.0) {
						numValue = -2.0;
					} else if (numValue > 2.0) {
						numValue = 2.0;
					}
					plugin.settings.presencePenalty = numValue;
					await plugin.saveSettings();
				}),
			);

		new Setting(containerEl)
			.setName('Frequency Penalty')
			.setDesc(
				SettingTab.createFragmentWithHTML(
					"Frequency penalty for the model, decreasing the model's likelihood to repeat the same line verbatim, defaults to <b>0.0</b>.",
				),
			)
			.addText(text =>
				text.setValue(plugin.settings.frequencyPenalty.toString()).onChange(async value => {
					let numValue = Number.parseFloat(value);
					if (numValue < -2.0) {
						numValue = -2.0;
					} else if (numValue > 2.0) {
						numValue = 2.0;
					}
					plugin.settings.frequencyPenalty = numValue;
					await plugin.saveSettings();
				}),
			);

		new Setting(containerEl)
			.setName('Max Tokens')
			.setDesc(
				SettingTab.createFragmentWithHTML(
					'Maximum number of tokens to generate, defaults to <b>2000</b>, see <a href="https://platform.openai.com/docs/api-reference/completions/create">OpenAI Reference</a> for more info',
				),
			)
			.addText(text =>
				text.setValue(plugin.settings.maxTokens.toString()).onChange(async value => {
					plugin.settings.maxTokens = Number.parseInt(value);
					await plugin.saveSettings();
				}),
			);

		containerEl.createEl('h2', { text: 'Debug Configurations:' });

		new Setting(containerEl)
			.setName('Debug Mode')
			.setDesc('Enable debug mode, which will log more information to the console')
			.addToggle(toggle =>
				toggle.setValue(plugin.settings.debugMode).onChange(async value => {
					plugin.settings.debugMode = value;
					await plugin.saveSettings();
				}),
			);
	}
}
