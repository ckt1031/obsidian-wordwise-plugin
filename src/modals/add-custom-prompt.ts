import { Modal, Notice, Setting } from 'obsidian';

import { CustomBehavior } from '@/config';
import type WordWisePlugin from '@/main';
import { retrieveAllPrompts } from '@/prompt';
import type { InputPrompt } from '@/schemas';

export default class AddCustomPromptModal extends Modal {
	private prompt: InputPrompt;

	// Readonly property, since this is required to locate the prompt in the settings before it has been edited
	private readonly originalName: string;

	private readonly isEdit: boolean;
	private readonly plugin: WordWisePlugin;

	// Action sync function or async function
	constructor(plugin: WordWisePlugin, isEdit: boolean, prompt?: InputPrompt) {
		super(plugin.app);

		this.plugin = plugin;

		this.isEdit = isEdit;

		if (isEdit) {
			this.prompt = prompt ?? {
				name: '',
				data: '',
				customBehavior: '',
				customPromptDefinedProvider: '',
			};
		}

		this.originalName = prompt?.name ?? '';
	}

	async submitForm(): Promise<void> {
		if (this.prompt.name === '' || this.prompt.data === '') {
			new Notice('Please fill out all fields');
			return;
		}

		// Check if name is already in use
		const result = this.plugin.settings.customPrompts.find(
			(prompt) => prompt.name === this.prompt.name,
		);

		if (!this.isEdit && result) {
			new Notice('Name already in use');
			return;
		}

		const updatedPrompt: InputPrompt = {
			...this.prompt,
		};

		if (this.isEdit) {
			const index = this.plugin.settings.customPrompts.findIndex(
				(prompt) => prompt.name === this.originalName,
			);

			this.plugin.settings.customPrompts[index] = updatedPrompt;
		} else {
			this.plugin.settings.customPrompts.push(updatedPrompt);
		}

		await this.plugin.saveSettings();

		// Reload the prompt list
		this.plugin.prompts = await retrieveAllPrompts(this.plugin);

		new Notice('Updated successfully');

		this.close();
	}

	onOpen() {
		const { contentEl } = this;

		contentEl.empty();

		this.setTitle(this.isEdit ? 'Edit Custom Prompt' : 'Add Custom Prompt');

		new Setting(contentEl).setName('Name:').addText((text) => {
			text.inputEl.style.width = '100%';
			text.setPlaceholder('Name (example: text-tone-helper)');
			text.onChange((value: string) => {
				this.prompt.name = value;
			});
			text.setValue(this.prompt.name);
		});

		new Setting(contentEl).setName('Prompt:').addTextArea((textArea) => {
			textArea.inputEl.className = 'modal-text-area';
			textArea.setPlaceholder('Change the tone of the text');
			textArea.onChange((value) => {
				this.prompt.data = value;
			});
			textArea.setValue(this.prompt.data);
		});

		new Setting(contentEl).setName('Behavior:').addDropdown((dropdown) => {
			Object.values(CustomBehavior).forEach((behavior) => {
				dropdown.addOption(behavior, behavior);
			});
			dropdown.setValue(this.prompt.customBehavior ?? CustomBehavior.Replace);
			dropdown.onChange((value) => {
				this.prompt.customBehavior = value;
			});
		});

		new Setting(contentEl).setName('Provider:').addDropdown((dropdown) => {
			// Add inherited provider
			dropdown.addOption('inherit', 'Inherit from settings');

			// Add all the API Providers, use value as option value
			for (const [providerName, data] of Object.entries(
				this.plugin.settings.aiProviderConfig,
			)) {
				const display =
					data.isCustom && data.displayName && data.displayName.length > 0
						? `Custom: ${data.displayName}`
						: providerName;
				dropdown.addOption(providerName, display);
			}

			dropdown.setValue(this.prompt.customPromptDefinedProvider ?? 'inherit');

			dropdown.onChange((value) => {
				this.prompt.customPromptDefinedProvider = value;
			});
		});

		new Setting(contentEl).addButton((btn) =>
			btn
				.setButtonText('Confirm')
				.setCta()
				.onClick(async () => {
					await this.submitForm();
				}),
		);
	}

	async onClose() {
		const { contentEl, plugin } = this;
		contentEl.empty();
		await plugin.app.setting.open();
		await plugin.app.setting.openTabById(plugin.manifest.id);
	}
}
