import type { TextAreaComponent, TextComponent } from 'obsidian';
import { Modal, Notice, Setting } from 'obsidian';

import type WordWisePlugin from '@/main';

export default class AddCustomPromptModal extends Modal {
	private name: string;
	private data: string;
	private readonly isEdit: boolean;
	private readonly plugin: WordWisePlugin;

	// Action sync function or async function
	constructor(
		plugin: WordWisePlugin,
		isEdit: boolean,
		name?: string,
		data?: string,
	) {
		super(plugin.app);
		this.name = '';
		this.data = '';
		this.plugin = plugin;

		this.isEdit = isEdit;

		if (isEdit) {
			this.name = name ?? '';
			this.data = data ?? '';
		}
	}

	async submitForm(): Promise<void> {
		if (this.name === '' || this.data === '') {
			new Notice('Please fill out all fields');
			return;
		}

		// Check if name is already in use
		const result = this.plugin.settings.customPrompts.find(
			(prompt) => prompt.name === this.name,
		);

		if (!this.isEdit && result) {
			new Notice('Name already in use');
			return;
		}

		if (this.isEdit) {
			const index = this.plugin.settings.customPrompts.findIndex(
				(prompt) => prompt.name === this.name,
			);

			this.plugin.settings.customPrompts[index] = {
				name: this.name,
				data: this.data,
			};
		} else {
			this.plugin.settings.customPrompts.push({
				name: this.name,
				data: this.data,
			});
		}

		await this.plugin.saveSettings();

		new Notice(
			`Please reload the plugin after ${
				this.isEdit ? 'editing' : 'adding'
			} a prompt`,
		);

		this.close();
	}

	onOpen() {
		const { contentEl, data, name } = this;
		contentEl.empty();
		this.setTitle(this.isEdit ? 'Edit Custom Prompt' : 'Add Custom Prompt');

		new Setting(contentEl).setName('Name:').addText((text: TextComponent) => {
			text.setPlaceholder('Name (example: text-tone-helper)');
			text.onChange((value: string) => {
				this.name = value;
			});
			text.setValue(name);
		});

		new Setting(contentEl)
			.setName('Prompt:')
			.addTextArea((textArea: TextAreaComponent) => {
				textArea.inputEl.className = 'modal-text-area';
				textArea.setPlaceholder('Change the tone of the text');
				textArea.onChange((value: string) => {
					this.data = value;
				});
				textArea.setValue(data);
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
