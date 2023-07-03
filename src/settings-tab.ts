/* eslint-disable unicorn/no-zero-fractions */
import type { App, ButtonComponent } from 'obsidian';
import { Notice, PluginSettingTab, Setting } from 'obsidian';

import manifest from '../manifest.json';
import { checkCredits } from './ai';
import type AiPlugin from './main';
import AddCustomPromptModal from './modals/add-custom-prompt';

export class SettingTab extends PluginSettingTab {
	plugin: AiPlugin;

	constructor(app: App, plugin: AiPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	private static createFragmentWithHTML = (html: string) =>
		createFragment(documentFragment => (documentFragment.createDiv().innerHTML = html));

	// eslint-disable-next-line sonarjs/cognitive-complexity
	display(): void {
		const { containerEl, plugin } = this;

		containerEl.empty();

		containerEl.createEl('h1', { text: manifest.name });

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
					'Base URL for the OpenAI API, defaults to <a href="https://api.openai.com">https://api.openai.com</a>.<br/><b>DO NOT include / trailing slash and /v1 suffix</b>.',
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
			.setName('Check OpenAI API Credit')
			.setDesc(
				SettingTab.createFragmentWithHTML(
					'This will check the remaining credits, expiring time and consumed credits for the OpenAI API',
				),
			)
			.addButton(button =>
				button.setButtonText('Check').onClick(async () => {
					const result = await checkCredits(plugin.settings);

					if (result) {
						new Notice(
							`You have ${result.remainingCredits.toFixed(2)}/${result.totalCredits.toFixed(
								2,
							)} credits remaining, expiring on ${result.expiryDate}`,
						);
					}
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
			.addSlider(slider => {
				slider.setDynamicTooltip();
				slider.setLimits(0.0, 1.0, 0.1);
				slider.setValue(plugin.settings.temperature);
				slider.onChange(async value => {
					plugin.settings.temperature = value;
					await plugin.saveSettings();
				});
			});

		new Setting(containerEl)
			.setName('Presence Penalty')
			.setDesc(
				SettingTab.createFragmentWithHTML(
					"Presence penalty for the model, increasing the model's likelihood to talk about new topics, defaults to <b>0.0</b>.",
				),
			)

			.addSlider(slider => {
				slider.setDynamicTooltip();
				slider.setLimits(-2.0, 2.0, 0.1);
				slider.setValue(plugin.settings.presencePenalty);
				slider.onChange(async value => {
					plugin.settings.presencePenalty = value;
					await plugin.saveSettings();
				});
			});

		new Setting(containerEl)
			.setName('Frequency Penalty')
			.setDesc(
				SettingTab.createFragmentWithHTML(
					"Frequency penalty for the model, decreasing the model's likelihood to repeat the same line verbatim, defaults to <b>0.0</b>.",
				),
			)
			.addSlider(slider => {
				slider.setDynamicTooltip();
				slider.setLimits(-2.0, 2.0, 0.1);
				slider.setValue(plugin.settings.frequencyPenalty);
				slider.onChange(async value => {
					plugin.settings.frequencyPenalty = value;
					await plugin.saveSettings();
				});
			});

		new Setting(containerEl)
			.setName('Max Tokens')
			.setDesc(
				SettingTab.createFragmentWithHTML(
					'Maximum number of tokens to generate, defaults to <b>2000</b>, see <a href="https://platform.openai.com/docs/api-reference/completions/create">OpenAI Reference</a> for more info',
				),
			)
			.addText(text =>
				text.setValue(plugin.settings.maxTokens.toString()).onChange(async value => {
					// Should be a number and not negative or zero
					if (!Number.isNaN(Number.parseInt(value)) && Number.parseInt(value) > 0) {
						plugin.settings.maxTokens = Number.parseInt(value);
						await plugin.saveSettings();
					}
				}),
			);

		new Setting(containerEl)
			.setName('Debug Mode')
			.setDesc('Enable debug mode, which will log more information to the console')
			.addToggle(toggle =>
				toggle.setValue(plugin.settings.debugMode).onChange(async value => {
					plugin.settings.debugMode = value;
					await plugin.saveSettings();
				}),
			);

		new Setting(containerEl)
			.setName('Reset Settings')
			.setDesc('This will reset all settings to their default values')
			.addButton(button => {
				button.setTooltip('Irrevisible action, please be careful!');
				button.setButtonText('Reset').onClick(async () => {
					if (button.buttonEl.textContent === 'Reset') {
						// Are you sure? (seconds), give 5 seconds, loop 5 times
						for (let i = 0; i < 5; i++) {
							button.setButtonText(`Are you sure to reset? (${5 - i})`);
							button.setDisabled(true);
							await new Promise(resolve => setTimeout(resolve, 1000));
						}

						button.setDisabled(false);
						button.setButtonText('Are you sure to reset?');

						setTimeout(() => {
							button.setButtonText('Reset');
						}, 5000);
					} else {
						// This has already been clicked once, so reset the settings
						await plugin.resetSettings();
						new Notice('Resetting settings to default values');
						await (plugin as any).app.setting.close();
					}
				});
			});

		containerEl.createEl('h2', { text: 'Custom Prompts' });

		new Setting(containerEl)
			.setDesc(
				"Here is a list of all the custom prompts you've created. You can edit or delete them here, or add a new one below.",
			)
			.addButton((cb: ButtonComponent) => {
				cb.setTooltip('Add a new custom prompt');
				cb.setButtonText('Add');
				cb.onClick(async () => {
					await (plugin as any).app.setting.close();
					new AddCustomPromptModal(plugin, false).open();
				});
			});

		for (const prompts of plugin.settings.customPrompts) {
			new Setting(containerEl)
				.setName(prompts.name)
				.addButton(button => {
					button.setIcon('pencil');
					button.setTooltip('Edit this prompt');
					button.onClick(async () => {
						await (plugin as any).app.setting.close();
						new AddCustomPromptModal(plugin, true, prompts.name, prompts.data).open();
					});
				})
				.addButton(button => {
					button.setIcon('cross');
					button.setTooltip('Delete this prompt');
					button.onClick(async () => {
						if (button.buttonEl.textContent === '') {
							// Are you sure? (seconds), give 5 seconds, loop 5 times
							for (let i = 0; i < 5; i++) {
								button.setButtonText(`Are you sure to delete? (${5 - i})`);
								button.setDisabled(true);
								await new Promise(resolve => setTimeout(resolve, 1000));
							}

							button.setDisabled(false);
							button.setButtonText('Are you sure to delete?');

							setTimeout(() => {
								button.setIcon('cross');
							}, 5000);
						} else {
							if (button.buttonEl.parentElement?.parentElement) {
								button.buttonEl.parentElement.parentElement.remove();
							}
							plugin.settings.customPrompts = plugin.settings.customPrompts.filter(
								p => p.name !== prompts.name,
							);
							await plugin.saveSettings();
						}
					});
				});
		}
	}
}
