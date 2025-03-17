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
			for (const [providerName, data] of Object.entries(
				settings.aiProviderConfig,
			)) {
				const display =
					data.isCustom && data.displayName && data.displayName.length > 0
						? `Custom: ${data.displayName}`
						: providerName;
				dropDown.addOption(providerName, display);
			}

			dropDown.setValue(settings.aiProvider);
			dropDown.onChange(async (value) => {
				settings.aiProvider = value as APIProvider;
				await plugin.saveSettings();
				await this.restartSettingsTab(plugin);
			});
		});

		for (const provider of Object.keys(settings.aiProviderConfig)) {
			if (settings.aiProvider === provider) {
				if (settings.aiProviderConfig[provider].isCustom) {
					const c = new Setting(containerEl);
					c.setName('Add New Custom Provider')
						.setDesc(
							"Add a provider with a different web address (API endpoint).  Make sure it's compatible with OpenAI.", // Less technical
						)
						.addButton((cb: ButtonComponent) => {
							cb.setButtonText('Add');
							cb.onClick(async () => {
								const numberOfCustomProviders = Object.values(
									settings.aiProviderConfig,
								).filter((x) => x.isCustom).length;

								const newProvider = `Custom ${numberOfCustomProviders + 1}`;
								settings.aiProviderConfig[newProvider] = {
									model: '',
									apiKey: '',
									baseUrl: '',
									isCustom: true,
								};
								settings.aiProvider = newProvider;
								await plugin.saveSettings();
								await this.restartSettingsTab(plugin);
							});
						});

					// Remove the custom provider, but the original custom provider cannot be removed
					if (provider !== APIProvider.Custom) {
						c.addButton((cb: ButtonComponent) => {
							cb.setButtonText('Remove');
							cb.onClick(async () => {
								if (cb.buttonEl.textContent === 'Remove') {
									// Are you sure? (seconds), give 5 seconds, loop 5 times
									for (let i = 0; i < 5; i++) {
										cb.setButtonText(`Sure? (${5 - i})`);
										cb.setDisabled(true);
										await sleep(1000);
									}

									cb.setDisabled(false);
									cb.setButtonText('Remove?');

									setTimeout(() => {
										cb.setButtonText('Remove');
									}, 5000);
								} else {
									delete settings.aiProviderConfig[provider];
									settings.aiProvider = APIProvider.OpenAI;
									await plugin.saveSettings();
									await this.restartSettingsTab(plugin);
								}
							});
						});
					}

					new Setting(containerEl)
						.setName('Provider Display Name')
						.addText((text) =>
							text
								.setPlaceholder('Enter a name for this provider')
								.setValue(
									settings.aiProviderConfig[provider]?.displayName || '',
								)
								.onChange(async (value) => {
									// Check if the display conflict with other display names or provider names
									const isConflict = Object.keys(APIProvider).some(
										(x) =>
											x === value ||
											settings.aiProviderConfig[x]?.displayName === value,
									);

									if (isConflict) {
										new Notice('Display name already exists');
										return;
									}

									settings.aiProviderConfig[provider].displayName = value;
									await plugin.saveSettings();
								}),
						);
				}

				new Setting(containerEl).setName('API Key').addText((text) => {
					wrapPasswordComponent(text);
					wrapAPITestComponent({ text, plugin });
					text
						.setPlaceholder('Enter your API Key')
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
					// provider === APIProvider.Custom
					settings.aiProviderConfig[provider].isCustom
				) {
					new Setting(containerEl)
						.setName('API Base URL')
						.setDesc(
							'Enter the web address for the API. Do not include a trailing slash or any extra parts of the address.',
						)
						.addText((text) =>
							text
								.setPlaceholder('https://api.example.com') // No trailing slash in placeholder
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
					new Setting(containerEl).setName('API Version').addText((text) =>
						text
							.setPlaceholder('2023-05-15')
							.setValue(settings.aiProviderConfig[provider].apiVersion || '')
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
			.setName('Generation Behavior')
			.setDesc(
				'Choose whether to replace the selected text or insert the generated text after it.',
			) // Clearer explanation
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
			.setName('Hide Thinking Text')
			.setDesc(
				"Some AI models show their 'thinking' process. Turn this on to hide that extra text.", // User-friendly explanation
			)
			.addToggle((toggle) =>
				toggle
					.setValue(settings.excludeThinkingOutput)
					.onChange(async (value) => {
						settings.excludeThinkingOutput = value;
						await plugin.saveSettings();
					}),
			);

		new Setting(containerEl).setName('Model Parameters').setHeading();

		new Setting(containerEl)
			.setName('Temperature')
			.setDesc(
				'Higher values make the AI more creative but less precise.  The default is 0.6.',
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
			.setName('Disable Pre-defined Commands')
			.setDesc(
				"This only works if you've set up custom instructions (prompts).",
			) // Clarified prerequisite
			.addToggle((toggle) =>
				toggle
					.setValue(settings.disableNativeCommands)
					.onChange(async (value) => {
						settings.disableNativeCommands = value;
						await plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName('Advanced Mode')
			.setDesc('Use advanced settings for the API (for experienced users).') // Added warning
			.addToggle((toggle) =>
				toggle.setValue(settings.advancedSettings).onChange(async (value) => {
					settings.advancedSettings = value;
					await plugin.saveSettings();
					await this.restartSettingsTab(plugin);
				}),
			);

		if (settings.advancedSettings) {
			new Setting(containerEl).setName('Advanced API Settings').setHeading();

			new Setting(containerEl)
				.setName('Disable System Instructions')
				.setDesc(
					'Some AI models might not work with system instructions.  Try turning this on if you have problems.',
				)
				.addToggle((toggle) =>
					toggle
						.setValue(settings.disableSystemInstructions)
						.onChange(async (value) => {
							settings.disableSystemInstructions = value;
							await plugin.saveSettings();
						}),
				);

			new Setting(containerEl)
				.setName('Omit Version Prefix')
				.setDesc(
					'Use the web address without the version number (e.g., /chat/completions instead of /v1/chat/completions). Some providers might do this automatically.',
				)
				.addToggle((toggle) =>
					toggle
						.setValue(
							settings.aiProviderConfig[settings.aiProvider]
								.omitVersionPrefix || false,
						)
						.onChange(async (value) => {
							settings.aiProviderConfig[settings.aiProvider].omitVersionPrefix =
								value;
							await plugin.saveSettings();
						}),
				);

			new Setting(containerEl)
				.setName('Custom Model ID')
				.setDesc(
					"If you don't enter anything here, the model selected above will be used.",
				) // Clarified
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
				.setName('Max Tokens')
				.setDesc(
					'The maximum number of words or characters the AI can generate. Set to 0 to use the default.',
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
				'This is a list of your custom instructions. You can edit, delete, or add new ones.',
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
			.setName('File Prompts')
			.setDesc('Use instructions from files in a specific folder.')
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
				.setName('Folder Path')
				.setDesc('The folder where your prompt files are located.')
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
			.setName('Enable Logging')
			.setDesc('Save all generated text to a log.')
			.addToggle((toggle) =>
				toggle
					.setValue(settings.enableGenerationLogging)
					.onChange(async (value) => {
						settings.enableGenerationLogging = value;
						await plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName('Import and Export Logs')
			.setDesc('Import or export your text generation logs.')
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
			.setName('Import and Export Settings')
			.setDesc('Import or export settings using a QR code or web address.')
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
			.setName('Reset Settings')
			.setDesc('This will reset all settings to their original values.')
			.addButton((button) => {
				button.setTooltip('This cannot be undone! Be careful.');
				button.setButtonText('Reset').onClick(async () => {
					if (button.buttonEl.textContent === 'Reset') {
						// Are you sure? (seconds), give 5 seconds, loop 5 times
						for (let i = 0; i < 5; i++) {
							button.setButtonText(`Are you sure? (${5 - i})`);
							button.setDisabled(true);
							await sleep(1000);
						}

						button.setDisabled(false);
						button.setButtonText('Are you sure?');

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
