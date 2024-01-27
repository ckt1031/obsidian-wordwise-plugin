import type { App, ButtonComponent } from 'obsidian';
import { Notice, PluginSettingTab, Setting } from 'obsidian';

import manifest from '../manifest.json';
import { ANTHROPIC_MODELS, GOOGLE_AI_MODELS, OPENAI_MODELS } from './config';
import type AiPlugin from './main';
import AddCustomPromptModal from './modals/add-custom-prompt';
import { APIProvider } from './types';
import { callAPI } from './utils/call-api';
import { log } from './utils/logging';

export class SettingTab extends PluginSettingTab {
	plugin: AiPlugin;

	constructor(app: App, plugin: AiPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	private static createFragmentWithHTML = (html: string) =>
		createFragment((documentFragment) => {
			const div = documentFragment.createDiv();
			div.innerHTML = html;
		});

	display(): void {
		const { containerEl, plugin } = this;

		containerEl.empty();

		containerEl.createEl('h1', { text: manifest.name });

		new Setting(containerEl)
			.setName('API Provider')
			.setDesc(
				'API Provider to be used, available options are OpenAI, Anthropic and Google AI',
			)
			.addDropdown((dropDown) => {
				// Add all the API Providers, use value as option value
				for (const provider of Object.values(APIProvider)) {
					dropDown.addOption(provider, provider);
				}

				dropDown.setValue(plugin.settings.apiProvider);
				dropDown.onChange(async (value) => {
					plugin.settings.apiProvider = value as APIProvider;
					await plugin.saveSettings();
					await plugin.app.setting.close();
					await plugin.app.setting.open();
					await plugin.app.setting.openTabById(manifest.id);
				});
			});

		if (plugin.settings.apiProvider === APIProvider.OpenAI) {
			new Setting(containerEl)
				.setName('OpenAI API Key')
				.setDesc('API Key for the OpenAI API')
				.addText((text) =>
					text
						.setPlaceholder('Enter your API Key')
						.setValue(plugin.settings.openAiApiKey)
						.onChange(async (value) => {
							plugin.settings.openAiApiKey = value;
							await plugin.saveSettings();
						}),
				);

			new Setting(containerEl)
				.setName('OpenAI Endpoint Base URL')
				.setDesc(
					SettingTab.createFragmentWithHTML(
						'Base URL for the OpenAI API, defaults to <code>https://api.openai.com</code>.<br/><b>DO NOT include / trailing slash and /v1 suffix</b>.',
					),
				)
				.addText((text) =>
					text
						.setPlaceholder('https://api.openai.com')
						.setValue(plugin.settings.openAiBaseUrl)
						.onChange(async (value) => {
							plugin.settings.openAiBaseUrl = value;
							await plugin.saveSettings();
						}),
				);

			new Setting(containerEl)
				.setName('OpenAI Language Model')
				.setDesc(
					SettingTab.createFragmentWithHTML(
						'Model to be used, defaults to <b>gpt-3.5-turbo</b>, see <a href="https://platform.openai.com/docs/models">OpenAI Models</a> for more info',
					),
				)
				.addDropdown((dropDown) => {
					for (const model of OPENAI_MODELS) {
						dropDown.addOption(model, model);
					}
					dropDown.setValue(plugin.settings.openAiModel);
					dropDown.onChange(async (value) => {
						plugin.settings.openAiModel = value;
						await plugin.saveSettings();
					});
				});
		}

		if (plugin.settings.apiProvider === APIProvider.Anthropic) {
			new Setting(containerEl)
				.setName('Anthropic API Key')
				.setDesc('API Key for the Anthropic API')
				.addText((text) =>
					text
						.setPlaceholder('Enter your API Key')
						.setValue(plugin.settings.anthropicApiKey)
						.onChange(async (value) => {
							plugin.settings.anthropicApiKey = value;
							await plugin.saveSettings();
						}),
				);

			new Setting(containerEl)
				.setName('Anthropic Endpoint Base URL')
				.setDesc(
					SettingTab.createFragmentWithHTML(
						'Base URL for the Anthropic API, defaults to <code>https://api.anthropic.com</code>.<br/><b>DO NOT include / trailing slash and /v1 suffix</b>.',
					),
				)
				.addText((text) =>
					text
						.setPlaceholder('https://api.anthropic.com')
						.setValue(plugin.settings.anthropicBaseUrl)
						.onChange(async (value) => {
							plugin.settings.anthropicBaseUrl = value;
							await plugin.saveSettings();
						}),
				);

			new Setting(containerEl)
				.setName('Anthropic Language Model')
				.setDesc(
					SettingTab.createFragmentWithHTML(
						'Model to be used, defaults to <b>claude-2.1</b>, see <a href="https://docs.anthropic.com/claude/reference/getting-started-with-the-api">Anthropic API Reference</a> for more info',
					),
				)
				.addDropdown((dropDown) => {
					for (const model of ANTHROPIC_MODELS) {
						dropDown.addOption(model, model);
					}
					dropDown.setValue(plugin.settings.anthropicModel);
					dropDown.onChange(async (value) => {
						plugin.settings.anthropicModel = value;
						await plugin.saveSettings();
					});
				});
		}

		if (plugin.settings.apiProvider === APIProvider.GoogleGemini) {
			new Setting(containerEl)
				.setName('Google AI API Key')
				.setDesc('API Key for the Google AI API')
				.addText((text) =>
					text
						.setPlaceholder('Enter your API Key')
						.setValue(plugin.settings.googleAIApiKey)
						.onChange(async (value) => {
							plugin.settings.googleAIApiKey = value;
							await plugin.saveSettings();
						}),
				);

			new Setting(containerEl)
				.setName('Google AI Endpoint Base URL')
				.setDesc(
					SettingTab.createFragmentWithHTML(
						'Base URL for the Google AI API, defaults to <code>https://generativelanguage.googleapis.com</code>.<br/><b>DO NOT include / trailing slash and /v1 suffix</b>.',
					),
				)
				.addText((text) =>
					text
						.setPlaceholder('https://generativelanguage.googleapis.com')
						.setValue(plugin.settings.googleAIBaseUrl)
						.onChange(async (value) => {
							plugin.settings.googleAIBaseUrl = value;
							await plugin.saveSettings();
						}),
				);

			new Setting(containerEl)
				.setName('Google AI Language Model')
				.setDesc(
					SettingTab.createFragmentWithHTML(
						'Model to be used, defaults to <b>gemini-pro</b>, see <a href="https://ai.google.dev/models/gemini">Google AI Models</a> for more info',
					),
				)
				.addDropdown((dropDown) => {
					for (const model of GOOGLE_AI_MODELS) {
						dropDown.addOption(model, model);
					}
					dropDown.setValue(plugin.settings.googleAIModel);
					dropDown.onChange(async (value) => {
						plugin.settings.googleAIModel = value;
						await plugin.saveSettings();
					});
				});
		}

		new Setting(containerEl)
			.setName('Check API Availability')
			.setDesc('Test if your API Key is valid and working.')
			.addButton((button) =>
				button.setButtonText('Check').onClick(async () => {
					try {
						new Notice('Checking API Status...');

						const result = await callAPI({
							settings: plugin.settings,
							userMessages: 'Say word hello only.',
						});

						if (result && result.length > 0) {
							new Notice('API Key is valid and working!');
						}
					} catch (error) {
						if (error instanceof Error) log(plugin.settings, error.message);
						new Notice('API is not working properly.');
					}
				}),
			);

		new Setting(containerEl)
			.setName('Advanced Mode')
			.setDesc(
				'Configure advanced model settings, enable this in order to send extra parameters to the API',
			)
			.addToggle((toggle) =>
				toggle
					.setValue(plugin.settings.advancedSettings)
					.onChange(async (value) => {
						plugin.settings.advancedSettings = value;
						await plugin.saveSettings();
						// Reload the settings tab
						await plugin.app.setting.close();
						await plugin.app.setting.open();
						await plugin.app.setting.openTabById(manifest.id);
					}),
			);

		if (plugin.settings.advancedSettings) {
			new Setting(containerEl)
				.setName('Temperature')
				.setDesc(
					SettingTab.createFragmentWithHTML(
						'Temperature for the model, defaults to <b>0.5</b>, see <a href="https://platform.openai.com/docs/api-reference/completions/create">OpenAI Reference</a> for more info',
					),
				)
				.addSlider((slider) => {
					slider.setDynamicTooltip();
					slider.setLimits(0.0, 1.0, 0.1);
					slider.setValue(plugin.settings.temperature);
					slider.onChange(async (value) => {
						plugin.settings.temperature = value;
						await plugin.saveSettings();
					});
				});

			new Setting(containerEl)
				.setName('Custom Model ID')
				.setDesc(
					'Enter custom model ID for your own API, if this is empty, it will follow the selected menu above.',
				)
				.addText((text) =>
					text
						.setPlaceholder('Enter the model name')
						.setValue(plugin.settings.customAiModel)
						.onChange(async (value) => {
							plugin.settings.customAiModel = value;
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

				.addSlider((slider) => {
					slider.setDynamicTooltip();
					slider.setLimits(-2.0, 2.0, 0.1);
					slider.setValue(plugin.settings.presencePenalty);
					slider.onChange(async (value) => {
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
				.addSlider((slider) => {
					slider.setDynamicTooltip();
					slider.setLimits(-2.0, 2.0, 0.1);
					slider.setValue(plugin.settings.frequencyPenalty);
					slider.onChange(async (value) => {
						plugin.settings.frequencyPenalty = value;
						await plugin.saveSettings();
					});
				});

			new Setting(containerEl)
				.setName('Max Tokens')
				.setDesc(
					SettingTab.createFragmentWithHTML(
						'Maximum number of tokens to generate (0 means not specifying in API)',
					),
				)
				.addText((text) =>
					text
						.setValue(plugin.settings.maxTokens.toString())
						.onChange(async (value) => {
							// Should be a number and not negative or zero
							if (
								!Number.isNaN(Number.parseInt(value)) &&
								Number.parseInt(value) >= 0
							) {
								plugin.settings.maxTokens = Number.parseInt(value);
								await plugin.saveSettings();
							}
						}),
				);
		}

		new Setting(containerEl)
			.setName('Debug Mode')
			.setDesc(
				'Enable debug mode, which will log more information to the console',
			)
			.addToggle((toggle) =>
				toggle.setValue(plugin.settings.debugMode).onChange(async (value) => {
					plugin.settings.debugMode = value;
					await plugin.saveSettings();
				}),
			);

		new Setting(containerEl)
			.setName('Reset Settings')
			.setDesc('This will reset all settings to their default values')
			.addButton((button) => {
				button.setTooltip('Irrevisible action, please be careful!');
				button.setButtonText('Reset').onClick(async () => {
					if (button.buttonEl.textContent === 'Reset') {
						// Are you sure? (seconds), give 5 seconds, loop 5 times
						for (let i = 0; i < 5; i++) {
							button.setButtonText(`Are you sure to reset? (${5 - i})`);
							button.setDisabled(true);
							await new Promise((resolve) => setTimeout(resolve, 1000));
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
						await plugin.app.setting.close();
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
					await plugin.app.setting.close();
					new AddCustomPromptModal(plugin, false).open();
				});
			});

		for (const prompts of plugin.settings.customPrompts) {
			new Setting(containerEl)
				.setName(prompts.name)
				.addButton((button) => {
					button.setIcon('pencil');
					button.setTooltip('Edit this prompt');
					button.onClick(async () => {
						const prompt = plugin.settings.customPrompts.find(
							(x) => x.name === prompts.name,
						);

						if (!prompt) return;

						await plugin.app.setting.close();
						new AddCustomPromptModal(
							plugin,
							true,
							prompts.name,
							prompt.data,
						).open();
					});
				})
				.addButton((button) => {
					button.setIcon('cross');
					button.setTooltip('Delete this prompt');
					button.onClick(async () => {
						if (button.buttonEl.textContent === '') {
							// Are you sure? (seconds), give 5 seconds, loop 5 times
							for (let i = 0; i < 5; i++) {
								button.setButtonText(`Are you sure to delete? (${5 - i})`);
								button.setDisabled(true);
								await new Promise((resolve) => setTimeout(resolve, 1000));
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
							plugin.settings.customPrompts =
								plugin.settings.customPrompts.filter(
									(p) => p.name !== prompts.name,
								);
							await plugin.saveSettings();
						}
					});
				});
		}
	}
}
