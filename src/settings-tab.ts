import type { App, ButtonComponent } from 'obsidian';
import { Notice, PluginSettingTab, Setting } from 'obsidian';

import { wrapFetchModelComponent } from './components/fetch-model';
import { wrapPasswordComponent } from './components/password';
import { wrapAPITestComponent } from './components/test-api';
import { APIProvider, CustomBehavior } from './config';
import type WordWisePlugin from './main';
import AddCustomPromptModal from './modals/add-custom-prompt';
import ImportSettingsModal from './modals/import-settings';
import ExportSettingsQrCodeModal from './modals/qr-code';
import { ForageStorage } from './utils/storage';

export class SettingTab extends PluginSettingTab {
	plugin: WordWisePlugin;

	constructor(app: App, plugin: WordWisePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	async restartSettingsTab(plugin: WordWisePlugin) {
		await plugin.app.setting.close();
		await plugin.app.setting.open();
		await plugin.app.setting.openTabById(plugin.manifest.id);
	}

	display(): void {
		const { containerEl, plugin } = this;
		const { settings } = plugin;

		containerEl.empty();

		new Setting(containerEl).setName('Provider').addDropdown((dropDown) => {
			// Add all the API Providers, use value as option value
			for (const provider of Object.values(APIProvider)) {
				dropDown.addOption(provider, provider);
			}

			dropDown.setValue(settings.aiProvider);
			dropDown.onChange(async (value) => {
				settings.aiProvider = value as APIProvider;
				await plugin.saveSettings();
				await this.restartSettingsTab(plugin);
			});
		});

		for (const provider of Object.values(APIProvider)) {
			if (settings.aiProvider === provider) {
				new Setting(containerEl).setName('API key').addText((text) => {
					wrapPasswordComponent(text);
					wrapAPITestComponent({ text, plugin });
					text
						.setPlaceholder(`Enter your ${provider} API Key`)
						.setValue(settings.aiProviderConfig[provider].apiKey)
						.onChange(async (value) => {
							// Update the API Key
							settings.aiProviderConfig[provider].apiKey = value;
							await plugin.saveSettings();
						});
				});

				if (
					settings.advancedSettings ||
					provider === APIProvider.AzureOpenAI ||
					provider === APIProvider.Custom
				) {
					new Setting(containerEl)
						.setName('API base URL')
						.setDesc('DO NOT include / trailing slash and paths.')
						.addText((text) =>
							text
								.setPlaceholder('https://api.example.com/v1')
								.setValue(settings.aiProviderConfig[provider].baseUrl)
								.onChange(async (value) => {
									// Update the Base URL
									settings.aiProviderConfig[provider].baseUrl = value;
									await plugin.saveSettings();
								}),
						);
				}

				if (provider === APIProvider.AzureOpenAI) {
					// API Version
					new Setting(containerEl).setName('API version').addText((text) =>
						text
							.setPlaceholder('2023-05-15')
							.setValue(settings.aiProviderConfig[provider].apiVersion)
							.onChange(async (value) => {
								// Update the API Version
								settings.aiProviderConfig[provider].apiVersion = value;
								await plugin.saveSettings();
							}),
					);
				}

				new Setting(containerEl)
					.setName('Model')
					.addDropdown(async (dropDown) => {
						const models = await new ForageStorage().getModels(provider);

						wrapFetchModelComponent({
							dropDown,
							plugin,
						});

						for (const model of models) {
							if (typeof model === 'string') {
								dropDown.addOption(model, model);
							} else {
								dropDown.addOption(model.id, model.name || model.id);
							}
						}
						dropDown.setValue(settings.aiProviderConfig[provider].model);
						dropDown.onChange(async (value) => {
							// Update the Model
							settings.aiProviderConfig[provider].model = value;
							await plugin.saveSettings();
						});
					});
			}
		}

		new Setting(containerEl)
			.setName('Override Generation Behavior')
			.setDesc('Replace or insert the generated text')
			.addDropdown((dropDown) => {
				// Add all the API Providers, use value as option value
				for (const value of Object.values(CustomBehavior)) {
					dropDown.addOption(value, value);
				}

				dropDown.setValue(settings.customBehavior);
				dropDown.onChange(async (value) => {
					settings.customBehavior = value as CustomBehavior;
					await plugin.saveSettings();
				});
			});

		new Setting(containerEl)
			.setName('Hide thinking content')
			.setDesc(
				'Models with reasoning capabilities may include thinking content in the generated text (<think>...</think>). Enable this to hide it.',
			)
			.addToggle((toggle) =>
				toggle
					.setValue(settings.doNotIncludeThinkingContentToFinalText)
					.onChange(async (value) => {
						settings.doNotIncludeThinkingContentToFinalText = value;
						await plugin.saveSettings();
					}),
			);

		new Setting(containerEl).setName('Advanced Model Parameters').setHeading();

		new Setting(containerEl)
			.setName('Disable pre-defined commands')
			.setDesc('This will only work if you have a custom prompt setup')
			.addToggle((toggle) =>
				toggle
					.setValue(settings.disableNativeCommands)
					.onChange(async (value) => {
						settings.disableNativeCommands = value;
						await plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName('Advanced mode')
			.setDesc('Enable this in order to send extra parameters to the API')
			.addToggle((toggle) =>
				toggle.setValue(settings.advancedSettings).onChange(async (value) => {
					settings.advancedSettings = value;
					await plugin.saveSettings();
					await this.restartSettingsTab(plugin);
				}),
			);

		if (settings.advancedSettings) {
			new Setting(containerEl)
				.setName('Temperature')
				.setDesc(
					'Higher value means more creative but less accurate, lower value means less creative but more accurate.',
				)
				.addSlider((slider) => {
					slider.setDynamicTooltip();
					slider.setLimits(0.0, 1.0, 0.1);
					slider.setValue(settings.temperature);
					slider.onChange(async (value) => {
						settings.temperature = value;
						await plugin.saveSettings();
					});
				});

			new Setting(containerEl)
				.setName('Custom model id')
				.setDesc('If this is empty, it will follow the selected menu above.')
				.addText((text) =>
					text
						.setPlaceholder('Enter the model name')
						.setValue(settings.customAiModel)
						.onChange(async (value) => {
							settings.customAiModel = value;
							await plugin.saveSettings();
						}),
				);

			new Setting(containerEl)
				.setName('Max tokens')
				.setDesc(
					'Maximum number of tokens to generate (Set to 0 to use the default value)',
				)
				.addText((text) =>
					text
						.setValue(settings.maxTokens.toString())
						.onChange(async (value) => {
							// Should be a number and not negative or zero
							if (
								!Number.isNaN(Number.parseInt(value)) &&
								Number.parseInt(value) >= 0
							) {
								settings.maxTokens = Number.parseInt(value);
								await plugin.saveSettings();
							}
						}),
				);
		}

		new Setting(containerEl).setName('Custom Prompts').setHeading();

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

		for (const prompts of settings.customPrompts) {
			new Setting(containerEl)
				.setName(prompts.name)
				.addButton((button) => {
					button.setIcon('pencil');
					button.setTooltip('Edit this prompt');
					button.onClick(async () => {
						const prompt = settings.customPrompts.find(
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
								await sleep(1000);
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
							settings.customPrompts = settings.customPrompts.filter(
								(p) => p.name !== prompts.name,
							);
							await plugin.saveSettings();
						}
					});
				});
		}

		new Setting(containerEl)
			.setName('File prompts')
			.setDesc(
				'Enable file prompts, this will load file prompts from the folder path specified below',
			)
			.addToggle((toggle) =>
				toggle
					.setValue(settings.customPromptsFromFolder.enabled)
					.onChange(async (value) => {
						settings.customPromptsFromFolder.enabled = value;
						await plugin.saveSettings();
						await this.restartSettingsTab(plugin);
					}),
			);

		if (settings.customPromptsFromFolder.enabled) {
			new Setting(containerEl)
				.setName('Folder path')
				.setDesc('Folder paths containing the files prompts')
				.addText((text) =>
					text
						.setPlaceholder('Enter the folder path')
						.setValue(settings.customPromptsFromFolder.path)
						.onChange(async (value) => {
							settings.customPromptsFromFolder.path = value;
							await plugin.saveSettings();
						}),
				);
		}

		new Setting(containerEl).setName('Text Generation Logging').setHeading();

		new Setting(containerEl)
			.setName('Enable')
			.setDesc('Enable to log all the generated text to the storage')
			.addToggle((toggle) =>
				toggle
					.setValue(settings.enableGenerationLogging)
					.onChange(async (value) => {
						settings.enableGenerationLogging = value;
						await plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName('Import and export')
			.setDesc('Import and export the text generation logs')
			.addButton((button) => {
				button.setButtonText('Import').onClick(async () => {
					const input = document.createElement('input');
					input.type = 'file';
					input.accept = 'application/json';
					input.onchange = async (event) => {
						const target = event.target as HTMLInputElement;
						const file = target.files?.[0];

						if (file) {
							const reader = new FileReader();
							reader.onload = async (e) => {
								const content = e.target?.result;
								if (typeof content === 'string') {
									const logs = JSON.parse(content);
									await new ForageStorage().setTextGenerationLogs(logs);
									new Notice('Text generation logs imported successfully');
								}
							};
							reader.readAsText(file);
						}
					};
					input.click();
				});
			})
			.addButton((button) => {
				button.setButtonText('Export').onClick(async () => {
					const logs = await new ForageStorage().getTextGenerationLogs();
					const blob = new Blob([JSON.stringify(logs)], {
						type: 'application/json',
					});

					const url = URL.createObjectURL(blob);

					const a = document.createElement('a');
					a.href = url;

					const vaultName = this.plugin.app.vault.getName();
					const nowMS = new Date().getTime();

					a.download = `${plugin.manifest.id}-text-generation-logs-${vaultName}-${nowMS}.json`;
					a.click();

					URL.revokeObjectURL(url);
				});
			});

		new Setting(containerEl).setName('Danger Zone').setHeading();

		new Setting(containerEl)
			.setName('Debug mode')
			.setDesc(
				'Enable debug mode, which will log more information to the console',
			)
			.addToggle((toggle) =>
				toggle.setValue(settings.debugMode).onChange(async (value) => {
					settings.debugMode = value;
					await plugin.saveSettings();
				}),
			);

		new Setting(containerEl)
			.setName('Import and export settings')
			.setDesc('Import and export settings as a QR code or RAW URL.')
			.addButton((button) => {
				button.setButtonText('Import').onClick(async () => {
					new ImportSettingsModal(this.plugin).open();
				});
			})
			.addButton((button) => {
				button.setButtonText('Export').onClick(async () => {
					new ExportSettingsQrCodeModal(this.plugin).open();
				});
			});

		new Setting(containerEl)
			.setName('Reset settings')
			.setDesc('This will reset all settings to their default values')
			.addButton((button) => {
				button.setTooltip('Irreversible action, please be careful!');
				button.setButtonText('Reset').onClick(async () => {
					if (button.buttonEl.textContent === 'Reset') {
						// Are you sure? (seconds), give 5 seconds, loop 5 times
						for (let i = 0; i < 5; i++) {
							button.setButtonText(`Are you sure to reset? (${5 - i})`);
							button.setDisabled(true);
							await sleep(1000);
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
						await this.restartSettingsTab(plugin);
					}
				});
			});
	}
}
