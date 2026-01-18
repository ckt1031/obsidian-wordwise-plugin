import { Notice, Setting } from 'obsidian';

import type WordWisePlugin from '@/main';
import ErrorDialogModal from '@/modals/error-dialog';
import { callTextAPI } from '@/utils/call-api';

type Props = {
	containerEl: HTMLElement;
	plugin: WordWisePlugin;
	provider: string;
};

export const renderApiKeySetting = ({
	containerEl,
	plugin,
	provider,
}: Props) => {
	const { settings } = plugin;
	const providerConfig = settings.aiProviderConfig[provider];

	const setting = new Setting(containerEl).setName('API Key');

	setting.addExtraButton((cb) => {
		cb.setIcon('zap')
			.setTooltip('Test API')
			.onClick(async () => {
				const modelToCall = providerConfig.model;

				const hasNoModelConfigurated = !modelToCall || modelToCall.length === 0;

				if (hasNoModelConfigurated) {
					new Notice(
						'Please fetch the models first and select a model first or set custom model',
					);
					return;
				}

				try {
					cb.setDisabled(true);
					cb.setIcon('loader-2');

					const result = await callTextAPI({
						plugin,
						providerSettings: providerConfig,
						model: modelToCall,
						provider: plugin.settings.aiProvider,
						messages: { system: '', user: 'Say word hello only.' },
						isTesting: true,
						stream: false,
					});

					if (!result || result.length === 0) {
						new Notice(`No result from ${plugin.settings.aiProvider}`);
						cb.setIcon('alert-circle');
						cb.extraSettingsEl.style.color = 'var(--text-error)';
						return;
					}

					new Notice('API is working properly');
					cb.setIcon('check');
					cb.extraSettingsEl.style.color = 'var(--text-success)';
				} catch (error) {
					cb.setIcon('alert-circle');
					cb.extraSettingsEl.style.color = 'var(--text-error)';

					let message = 'API is not working properly';
					if (error instanceof Error) {
						message += `: ${error.message}`;
						if (
							typeof error.cause === 'string' ||
							error.cause instanceof Error
						) {
							new ErrorDialogModal(
								plugin,
								`Test API Failed: ${providerConfig.model}`,
								error.cause,
							).open();
						}
					}

					console.info(error);
					new Notice(message);
				} finally {
					cb.setDisabled(false);
					setTimeout(() => {
						cb.setIcon('zap');
						cb.extraSettingsEl.style.color = '';
					}, 5000);
				}
			});
	});

	let inputEl: HTMLInputElement;

	setting.addExtraButton((cb) => {
		cb.setIcon('eye-off')
			.setTooltip('Toggle password visibility')
			.onClick(() => {
				const isText = inputEl.getAttribute('type') === 'text';
				const icon = isText ? 'eye-off' : 'eye';
				const type = isText ? 'password' : 'text';
				cb.setIcon(icon);
				inputEl.setAttribute('type', type);
				inputEl.focus();
			});
	});

	setting.addText((component) => {
		inputEl = component.inputEl;
		component
			.setPlaceholder('Enter your API Key')
			.setValue(providerConfig.apiKey)
			.onChange(async (value: string) => {
				providerConfig.apiKey = value;
				await plugin.saveSettings();
			});
		inputEl.setAttribute('type', 'password');
	});
};
