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
			text: 'Paste the string data or protocol URI here:',
		});

		new Setting(contentEl).setName('String:').addText((text: TextComponent) => {
			text.setPlaceholder('Here');
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
					const data = this.data.trim();

					if (!data) {
						new Notice('Please enter a valid string');
						return;
					}

					// const protocolURL = `obsidian://${this.plugin.manifest.id}?func=import&version=${this.plugin.manifest.version}&vault=${vault}&data=${data}`;

					if (data.startsWith('obsidian://')) {
						// Parse the URI
						const qs = new URL(data).searchParams;
						const func = qs.get('func');
						const vault = qs.get('vault');
						const encodedData = qs.get('data');

						if (!vault || !encodedData || !func) {
							new Notice('Invalid URI format');
							return;
						}

						if (func !== 'import') {
							new Notice('Invalid function in URI');
							return;
						}

						if (decodeURIComponent(vault) !== this.plugin.app.vault.getName()) {
							new Notice('Invalid vault name in URI');
							return;
						}

						this.data = encodedData;
					}

					await this.submitForm();
				}),
		);
	}

	async submitForm() {
		const { data } = this;

		new SettingsExportImport(this.plugin).importEncodedData(data);

		this.close();
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
