import type WordWisePlugin from '@/main';
import SettingsExportImport from '@/utils/settings-sharing';
import { Modal, Notice, Setting, type TextComponent } from 'obsidian';

export default class ImportSettingsModal extends Modal {
	private data: string;
	private readonly plugin: WordWisePlugin;

	constructor(plugin: WordWisePlugin) {
		super(plugin.app);
		this.plugin = plugin;
		this.data = '';
	}

	async onOpen() {
		const { contentEl, data } = this;

		const div1 = contentEl.createDiv();

		div1.createEl('p', {
			text: 'Paste the string data here:',
		});

		new Setting(contentEl).setName('String:').addText((text: TextComponent) => {
			text.setPlaceholder('String, not the URI.');
			text.onChange((value: string) => {
				this.data = value;
			});
			text.setValue(data);
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

	async submitForm() {
		const { data } = this;

		const result = await new SettingsExportImport(this.plugin).importQrCodeUri({
			func: 'import',
			vault: this.plugin.app.vault.getName(),
			data,
		});

		if (result.status === 'ok') {
			new Notice('Settings imported successfully');
			this.close();
		} else {
			new Notice(result.message);
		}
		this.close();
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
