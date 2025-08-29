import {
	Notice,
	type Setting,
	setIcon,
	setTooltip,
	type TextComponent,
} from 'obsidian';

import { APIProvider } from '@/config';
import type WordWisePlugin from '@/main';
import ErrorDialogModal from '@/modals/error-dialog';
import { callTextAPI } from '@/utils/call-api';

type Props = {
	setting: Setting;
	text: TextComponent;
	plugin: WordWisePlugin;
};

export const wrapAPIKeyComponent = ({ setting, text, plugin }: Props) => {
	// Container to hold the action buttons (password toggle + test)
	const buttonContainer = document.createElement('div');
	buttonContainer.className = 'settings-button-row';

	// Configure the parent control element to allow wrapping
	setting.controlEl.className = 'settings-input-wrapper';

	// Create buttons
	const toggleButton = document.createElement('button') as HTMLButtonElement;
	const testButton = document.createElement('button') as HTMLButtonElement;

	// Add buttons to container
	buttonContainer.appendChild(toggleButton);
	buttonContainer.appendChild(testButton);

	// Insert the container before the input element
	text.inputEl.insertAdjacentElement('beforebegin', buttonContainer);

	// Setup password toggle button
	setTooltip(toggleButton, 'Toggle password visibility');
	setIcon(toggleButton, 'eye-off');

	toggleButton.addEventListener('click', () => {
		const isText = text.inputEl.getAttribute('type') === 'text';
		const icon = isText ? 'eye-off' : 'eye';
		const type = isText ? 'password' : 'text';
		setIcon(toggleButton, icon);
		text.inputEl.setAttribute('type', type);
		text.inputEl.focus();
	});

	// Initial type is password
	text.inputEl.setAttribute('type', 'password');

	// Setup test button
	testButton.textContent = 'Test';
	testButton.addEventListener('click', async () => {
		const providerSettings =
			plugin.settings.aiProviderConfig[plugin.settings.aiProvider];

		const modelToCall =
			providerSettings.customModelId &&
			providerSettings.customModelId.length > 0
				? providerSettings.customModelId
				: providerSettings.model;

		const hasNoModelConfigurated = !modelToCall || modelToCall.length === 0;

		if (
			plugin.settings.aiProvider === APIProvider.AzureOpenAI &&
			hasNoModelConfigurated
		) {
			new Notice(
				'You must configure the model ID from Azure OpenAI in the settings',
			);
			return;
		}

		if (hasNoModelConfigurated) {
			new Notice(
				'Please fetch the models first and select a model first or set custom model',
			);
			return;
		}

		try {
			const result = await callTextAPI({
				plugin,
				providerSettings,
				model: modelToCall,
				provider: plugin.settings.aiProvider,
				messages: { system: '', user: 'Say word hello only.' },
				isTesting: true,
				stream: false,
			});

			if (!result || result.length === 0) {
				new Notice(`No result from ${plugin.settings.aiProvider}`);
				return;
			}

			new Notice('API is working properly');
			testButton.textContent = 'Success';
			testButton.style.color = '#28FF1E';
		} catch (error) {
			testButton.textContent = 'Error';
			testButton.style.color = '#FF0000';

			let message = 'API is not working properly';
			if (error instanceof Error) {
				message += `: ${error.message}`;
				if (typeof error.cause === 'string' || error.cause instanceof Error) {
					new ErrorDialogModal(
						plugin,
						`Test API Failed: ${providerSettings.model}`,
						error.cause,
					).open();
				}
			}

			console.info(error);
			new Notice(message);
		}
	});

	return text;
};
