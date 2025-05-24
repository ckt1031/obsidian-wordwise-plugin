import {
	type ButtonComponent,
	Notice,
	Platform,
	PluginSettingTab,
	Setting,
} from 'obsidian';

import { nanoid } from 'nanoid';
import { debounce } from 'rambdax';

import { wrapFetchModelComponent } from './components/fetch-model';
import { wrapPasswordComponent } from './components/password';
import { wrapAPITestComponent } from './components/test-api';
import { APIProvider, CustomBehavior } from './config';
import type WordWisePlugin from './main';
import AddCustomPromptModal from './modals/add-custom-prompt';
import ExportSettingsModal from './modals/export-settings';
import ImportSettingsModal from './modals/import-settings';
import {
	downloadFileWithFilePicker,
	saveFileToObsidianConfigFolder,
} from './utils/download';
import { ForageStorage } from './utils/storage';

export class SettingsTab extends PluginSettingTab {
	private readonly plugin: WordWisePlugin;
	private readonly forage: ForageStorage;

	// Settings elements
	private filePromptsEl: HTMLElement;
	private advancedSettingsEl: HTMLElement;
	private providerEl: HTMLElement[] = [];

	constructor(plugin: WordWisePlugin) {
		super(plugin.app, plugin);
		this.plugin = plugin;
		this.forage = new ForageStorage();
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

				// Hide all provider settings
				for (const provider of this.providerEl) {
					provider.style.display = 'none';

					if (provider.className === `provider-settings-${value}`) {
						provider.style.display = 'block';
					}
				}
			});
		});

		for (const provider of Object.keys(settings.aiProviderConfig)) {
			const providerSettingsEl = containerEl.createDiv(
				`provider-settings-${provider}`,
			);

			// Divider
			new Setting(providerSettingsEl);

			if (settings.aiProvider !== provider) {
				providerSettingsEl.style.display = 'none';
			}

			// Add to the providerEl array
			this.providerEl.push(providerSettingsEl);

			if (settings.aiProviderConfig[provider].isCustom) {
				const c = new Setting(providerSettingsEl);
				c.setName('Create New Custom Provider')
					.setDesc(
						"Create a provider with a different API endpoint.  Make sure it's compatible with OpenAI.",
					)
					.addButton((cb: ButtonComponent) => {
						cb.setButtonText('Create');
						cb.onClick(async () => {
							const newProvider = `Custom ${nanoid(4)}`;
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
								this.forage.removeModels(provider);
								settings.aiProvider = APIProvider.OpenAI;
								await plugin.saveSettings();
								await this.restartSettingsTab(plugin);
							}
						});
					});
				}

				new Setting(providerSettingsEl)
					.setName('Provider Display Name')
					.addText((text) =>
						text
							.setPlaceholder('Enter a name for this provider')
							.setValue(settings.aiProviderConfig[provider]?.displayName || '')
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

			new Setting(providerSettingsEl).setName('API Key').addText((text) => {
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
				new Setting(providerSettingsEl)
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
				new Setting(providerSettingsEl).setName('API Version').addText((text) =>
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

			const modelSetting = new Setting(providerSettingsEl);

			modelSetting.setName('Model');

			if (provider === APIProvider.AzureOpenAI) {
				// Set model as text input
				modelSetting.addText((text) =>
					text
						.setPlaceholder('gpt-4o-mini')
						.setValue(settings.aiProviderConfig[provider].model || '')
						.onChange(async (value) => {
							// Update the model
							settings.aiProviderConfig[provider].model = value;
							await plugin.saveSettings();
						}),
				);
			} else {
				modelSetting.addDropdown(async (dropDown) => {
					const models = await this.forage.getModels(provider);

					// Find out the only select element in the containerEl
					const selectElement = modelSetting.settingEl.find(
						'select',
					) as HTMLSelectElement;

					wrapFetchModelComponent({
						dropDown,
						setting: modelSetting,
						plugin,
						triggerUIClearModels: () => {
							// Remove all options and fill it with the new models
							selectElement.innerHTML = '';

							// Add the new models to the dropdown
							for (const model of models) {
								selectElement.remove(models.indexOf(model));
							}
						},
						onUpdateModels: (models) => {
							// Remove all options and fill it with the new models
							selectElement.innerHTML = '';

							// Add the new models to the dropdown
							for (const model of models) {
								selectElement.remove(models.indexOf(model));
							}

							for (const model of models) {
								if (typeof model === 'string') {
									dropDown.addOption(model, model);
								} else {
									dropDown.addOption(model.id, model.name || model.id);
								}
							}

							// Set the value to the current model
							dropDown.setValue(settings.aiProviderConfig[provider].model);
						},
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
			)
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

		// Streaming
		new Setting(containerEl)
			.setName('Streaming')
			.setDesc(
				'Enable streaming mode to receive text as it is generated. This is not supported with Azure OpenAI.',
			)
			.addToggle((toggle) =>
				toggle.setValue(settings.enableStreaming).onChange(async (value) => {
					settings.enableStreaming = value;
					await plugin.saveSettings();
				}),
			);

		// Platform specific settings
		if (Platform.isDesktop) {
			new Setting(containerEl)
				.setName('Enable Status Bar Button')
				.setDesc(
					'Enable a button in the status bar to interrupt the AI when it is generating text. This is useful if you want to stop the generation process.',
				)
				.addToggle((toggle) =>
					toggle
						.setValue(settings.enableStatusBarButton)
						.onChange(async (value) => {
							settings.enableStatusBarButton = value;
							await plugin.saveSettings();
							this.plugin.updateStatusBar();
						}),
				);
		}

		new Setting(containerEl)
			.setName('Enable Confirmation Modal')
			.setDesc(
				'Show a confirmation modal before inserting the generated text, allowing you to review it first.',
			)
			.addToggle((toggle) =>
				toggle
					.setValue(settings.enableConfirmationModal)
					.onChange(async (value) => {
						settings.enableConfirmationModal = value;
						await plugin.saveSettings();
					}),
			);

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
			.setName('Disable Internal Prompts')
			.setDesc(
				'Remove internal sets of prompts that are used to generate text. This is useful if you want to use your own prompts only.',
			)
			.addToggle((toggle) =>
				toggle
					.setValue(settings.disableInternalPrompts)
					.onChange(async (value) => {
						settings.disableInternalPrompts = value;
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
					// Toggle advanced settings visibility
					this.advancedSettingsEl.style.display = value ? 'block' : 'none';
				}),
			);

		// Initialize advanced settings container
		this.advancedSettingsEl = containerEl.createDiv('advanced-settings');
		// Hide advanced settings by default
		this.advancedSettingsEl.style.display = settings.advancedSettings
			? 'block'
			: 'none';

		new Setting(this.advancedSettingsEl)
			.setName('Advanced API Settings')
			.setHeading();

		new Setting(this.advancedSettingsEl)
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

		new Setting(this.advancedSettingsEl)
			.setName('Omit Version Prefix')
			.setDesc(
				'Use the web address without the version number (e.g., /chat/completions instead of /v1/chat/completions). Some providers might do this automatically.',
			)
			.addToggle((toggle) =>
				toggle
					.setValue(
						settings.aiProviderConfig[settings.aiProvider].omitVersionPrefix ||
							false,
					)
					.onChange(async (value) => {
						settings.aiProviderConfig[settings.aiProvider].omitVersionPrefix =
							value;
						await plugin.saveSettings();
					}),
			);

		new Setting(this.advancedSettingsEl)
			.setName('Custom Model ID')
			.setDesc(
				"If you don't enter anything here, the model selected above will be used.",
			)
			.addText((text) =>
				text
					.setPlaceholder('Enter the model name')
					.setValue(settings.customAiModel)
					.onChange(async (value) => {
						settings.customAiModel = value;
						await plugin.saveSettings();
					}),
			);

		new Setting(this.advancedSettingsEl)
			.setName('Max Tokens')
			.setDesc(
				'The maximum number of words or characters the AI can generate. Set to 0 to use the default.',
			)
			.addText((text) =>
				text.setValue(settings.maxTokens.toString()).onChange(async (value) => {
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
			const index = settings.customPrompts.indexOf(prompts);
			new Setting(containerEl)
				.setName(`${index + 1}: ${prompts.name}`)
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
						// Toggle file prompts visibility
						this.filePromptsEl.style.display = value ? 'block' : 'none';
					}),
			);

		// Initialize file prompts container
		this.filePromptsEl = containerEl.createDiv('file-prompts');
		// Hide file prompts by default
		this.filePromptsEl.style.display = settings.customPromptsFromFolder.enabled
			? 'block'
			: 'none';

		new Setting(this.filePromptsEl)
			.setName('Folder Path')
			.setDesc('The folder where your prompt files are located.')
			.addText((text) =>
				text
					.setPlaceholder('Enter the folder path')
					.setValue(settings.customPromptsFromFolder.path)
					.onChange(
						debounce(async (value: string) => {
							const folder = this.plugin.app.vault.getFolderByPath(value);
							if (!folder) new Notice(`Folder (${value}) does not exist`);

							settings.customPromptsFromFolder.path = value;
							await plugin.saveSettings();
						}, 1500),
					),
			);

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
									await this.forage.setTextGenerationLogs(logs);
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
					const logs = await this.forage.getTextGenerationLogs();

					if (logs.length === 0) {
						new Notice('No text generation logs to export');
						return;
					}

					const blob = new Blob([JSON.stringify(logs)], {
						type: 'application/json',
					});

					const nowMS = new Date().getTime();
					const vaultName = this.plugin.app.vault.getName();
					const fileName = Platform.isMobileApp
						? `text-generation-logs-${nowMS}.json`
						: `${plugin.manifest.id}-text-generation-logs-${vaultName}-${nowMS}.json`;

					if (!Platform.isMobileApp) {
						await downloadFileWithFilePicker(blob, fileName);
						return;
					}

					const file = await saveFileToObsidianConfigFolder(
						this.plugin,
						blob,
						fileName,
					);

					new Notice(`Saved to ${file}`);
				});
			});

		new Setting(containerEl).setName('Danger Zone').setHeading();

		new Setting(containerEl)
			.setName('Obfuscate Config')
			.setDesc(
				'Prevent API keys from being visible and tampered with. This might slow down the performance when loading settings.',
			)
			.addToggle((toggle) =>
				toggle.setValue(settings.obfuscateConfig).onChange(async (value) => {
					settings.obfuscateConfig = value;
					await plugin.saveSettings();
				}),
			);

		new Setting(containerEl)
			.setName('Import and Export Settings')
			.setDesc('Import or export settings using text or URL.')
			.addButton((button) => {
				button.setButtonText('Import').onClick(async () => {
					new ImportSettingsModal(this.plugin).open();
				});
			})
			.addButton((button) => {
				button.setButtonText('Export').onClick(async () => {
					new ExportSettingsModal(this.plugin).open();
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
