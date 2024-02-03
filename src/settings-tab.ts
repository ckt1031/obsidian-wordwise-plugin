import type { App, ButtonComponent } from 'obsidian';
import { Notice, PluginSettingTab, Setting } from 'obsidian';

import manifest from '../manifest.json';
import { wrapPasswordComponent } from './components/password';
import {
	ANTHROPIC_MODELS,
	DEFAULT_ANTHROPIC_API_HOST,
	DEFAULT_GOOGLE_AI_API_HOST,
	DEFAULT_OPENAI_API_HOST,
	GOOGLE_AI_MODELS,
	OPENAI_MODELS,
} from './config';
import type WordWisePlugin from './main';
import AddCustomPromptModal from './modals/add-custom-prompt';
import { APIProvider } from './types';
import { callAPI } from './utils/call-api';
import { log } from './utils/logging';

async function restartSettingsTab(plugin: WordWisePlugin) {
	await plugin.app.setting.close();
	await plugin.app.setting.open();
	await plugin.app.setting.openTabById(manifest.id);
}

export class SettingTab extends PluginSettingTab {
	plugin: WordWisePlugin;

	constructor(app: App, plugin: WordWisePlugin) {
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
					restartSettingsTab(plugin);
				});
			});

		const apiConfiguration = {
			[APIProvider.OpenAI]: {
				apiKey: 'openAiApiKey' as const,
				baseUrl: 'openAiBaseUrl' as const,
				model: 'openAiModel' as const,
				defaultHost: DEFAULT_OPENAI_API_HOST,
				docs: 'https://platform.openai.com/docs/introduction',
				defaultModel: 'gpt-3.5-turbo',
			},
			[APIProvider.Anthropic]: {
				apiKey: 'anthropicApiKey' as const,
				baseUrl: 'anthropicBaseUrl' as const,
				model: 'anthropicModel' as const,
				defaultHost: DEFAULT_ANTHROPIC_API_HOST,
				docs: 'https://docs.anthropic.com/claude/reference/getting-started-with-the-api',
				defaultModel: 'claude-2.1',
			},
			[APIProvider.GoogleGemini]: {
				apiKey: 'googleAIApiKey' as const,
				baseUrl: 'googleAIBaseUrl' as const,
				model: 'googleAIModel' as const,
				defaultHost: DEFAULT_GOOGLE_AI_API_HOST,
				docs: 'https://ai.google.dev/models/gemini',
				defaultModel: 'gemini-pro',
			},
		};

		for (const [provider, config] of Object.entries(apiConfiguration)) {
			if (plugin.settings.apiProvider === provider) {
				new Setting(containerEl)
					.setName(`${provider} API Key`)
					.setDesc(`API Key for the ${provider} API`)
					.addText((text) => {
						wrapPasswordComponent(text);
						text
							.setPlaceholder(`Enter your ${provider} API Key`)
							.setValue(plugin.settings[config.apiKey])
							.onChange(async (value) => {
								// Update the API Key
								plugin.settings[config.apiKey] = value;
								await plugin.saveSettings();
							});
					});

				new Setting(containerEl)
					.setName(`${provider} Endpoint Base URL`)
					.setDesc(
						SettingTab.createFragmentWithHTML(
							`Base URL for the ${provider} API, defaults to <code>${config.defaultHost}</code>.<br/><b>DO NOT include / trailing slash and paths</b>.`,
						),
					)
					.addText((text) =>
						text
							.setPlaceholder(config.defaultHost)
							.setValue(plugin.settings[config.baseUrl])
							.onChange(async (value) => {
								// Update the Base URL
								plugin.settings[config.baseUrl] = value;
								await plugin.saveSettings();
							}),
					);

				new Setting(containerEl)
					.setName(`${provider} Language Model`)
					.setDesc(
						SettingTab.createFragmentWithHTML(
							`Model to be used, defaults to <b>${config.defaultModel}</b>, see <a href="${config.docs}">${provider} Models</a> for more info`,
						),
					)
					.addDropdown((dropDown) => {
						for (const model of provider === APIProvider.OpenAI
							? OPENAI_MODELS
							: provider === APIProvider.Anthropic
							  ? ANTHROPIC_MODELS
							  : GOOGLE_AI_MODELS) {
							dropDown.addOption(model, model);
						}
						dropDown.setValue(plugin.settings[config.model]);
						dropDown.onChange(async (value) => {
							// Update the Model
							plugin.settings[config.model] = value;
							await plugin.saveSettings();
						});
					});
			}
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
							userMessage: 'Say word hello only.',
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
						restartSettingsTab(plugin);
					}),
			);

		if (plugin.settings.advancedSettings) {
			new Setting(containerEl)
				.setName('Temperature')
				.setDesc(
					'Temperature for the model, defaults to <b>0.5</b> for best suitable results, higher value means more creative but less accurate, lower value means less creative but more accurate.',
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
						"(OpenAI ONLY) Presence penalty for the model, increasing the model's likelihood to talk about new topics, defaults to <b>0.0</b>.",
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
						"(OpenAI ONLY) Frequency penalty for the model, decreasing the model's likelihood to repeat the same line verbatim, defaults to <b>0.0</b>.",
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
						restartSettingsTab(plugin);
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
