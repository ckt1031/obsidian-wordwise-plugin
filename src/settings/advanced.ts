import { Setting } from 'obsidian';

import { type APIProvider, PROVIDER_DEFAULTS } from '@/config';
import type { SettingsTab } from '.';

export const renderAdvancedSettings = (settingsTab: SettingsTab) => {
	const { containerEl, plugin } = settingsTab;
	const { settings } = settingsTab.plugin;

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
				settingsTab.display(); // Refresh the settings tab
			}),
		);

	if (settings.advancedSettings) {
		new Setting(containerEl).setName('Advanced API Settings').setHeading();

		new Setting(containerEl)
			.setName("Don't Pass System Instructions to API")
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
			.setName('Max Tokens')
			.setDesc(
				'The maximum number of words or characters the AI can generate. Set to 0 to use the default.',
			)
			.addText((text) =>
				text
					.setValue(
						settings.aiProviderConfig[
							settings.aiProvider
						].maxTokens?.toString() || '',
					)
					.onChange(async (value) => {
						// Should be a number and not negative or zero
						if (
							!Number.isNaN(Number.parseInt(value, 10)) &&
							Number.parseInt(value, 10) >= 0
						) {
							settings.aiProviderConfig[settings.aiProvider].maxTokens =
								Number.parseInt(value, 10);
							await plugin.saveSettings();
						}
					}),
			);

		// Only when custom provider is selected
		if (settings.aiProviderConfig[settings.aiProvider].isCustom) {
			new Setting(containerEl).setName('Custom Endpoints').setHeading();

			new Setting(containerEl)
				.setName('Custom Models Endpoint')
				.setDesc(
					'The endpoint to fetch models from. Leave empty to use the default.',
				)
				.addText((text) =>
					text
						.setPlaceholder(
							PROVIDER_DEFAULTS[settings.aiProvider as APIProvider]?.models ||
								'/v1/models',
						)
						.setValue(
							settings.aiProviderConfig[settings.aiProvider].modelsPath || '',
						)
						.onChange(async (value) => {
							settings.aiProviderConfig[settings.aiProvider].modelsPath = value;
							await plugin.saveSettings();
						}),
				);

			new Setting(containerEl)
				.setName('Custom Chat Endpoint')
				.setDesc(
					'The endpoint for chat completions. Leave empty to use the default.',
				)
				.addText((text) =>
					text
						.setPlaceholder(
							PROVIDER_DEFAULTS[settings.aiProvider as APIProvider]?.chat ||
								'/v1/chat/completions',
						)
						.setValue(
							settings.aiProviderConfig[settings.aiProvider].chatPath || '',
						)
						.onChange(async (value) => {
							settings.aiProviderConfig[settings.aiProvider].chatPath = value;
							await plugin.saveSettings();
						}),
				);
		}
	}
};
