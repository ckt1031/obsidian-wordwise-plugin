import { Platform, Setting } from 'obsidian';

import { CustomBehavior } from '../config';
import type { SettingsTab } from '.';

export const renderBehaviorSettings = (settingsTab: SettingsTab) => {
	const { containerEl, plugin } = settingsTab;
	const { settings } = settingsTab.plugin;

	new Setting(containerEl).setName('Behavior').setHeading();

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
		.setDesc('Enable streaming mode to receive text as it is generated.')
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
						plugin.updateStatusBar();
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
			slider.setValue(
				settings.aiProviderConfig[settings.aiProvider].temperature || 0.6,
			);
			slider.onChange(async (value) => {
				settings.aiProviderConfig[settings.aiProvider].temperature = value;
				await plugin.saveSettings();
			});
		});
};
