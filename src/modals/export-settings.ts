import type WordWisePlugin from '@/main';
import SettingsExportImport from '@/utils/settings-sharing';
import { Modal, Notice } from 'obsidian';

export default class ExportSettingsQrCodeModal extends Modal {
	private readonly plugin: WordWisePlugin;

	constructor(plugin: WordWisePlugin) {
		super(plugin.app);
		this.plugin = plugin;
	}

	async onOpen() {
		const { contentEl } = this;

		const settingsExportImport = new SettingsExportImport(this.plugin);
		const { protocolURL, encodedDataString } =
			settingsExportImport.generateSettingsStrings();

		const topDiv = contentEl.createDiv();
		topDiv.createEl('p', {
			text: 'Scan the QR code with your mobile device to import the settings',
		});

		const buttonsDiv = contentEl.createDiv();

		buttonsDiv.createEl(
			'button',
			{
				text: 'Copy URI',
			},
			(el) => {
				el.onclick = async () => {
					await navigator.clipboard.writeText(protocolURL);
					new Notice('URI copied to clipboard');
				};
			},
		);

		// Copy Data string
		buttonsDiv.createEl(
			'button',
			{
				text: 'Copy Data String',
				cls: 'log-delete-button',
			},
			(el) => {
				el.onclick = async () => {
					await navigator.clipboard.writeText(encodedDataString);
					new Notice('Data copied to clipboard');
				};
			},
		);
	}

	onClose() {
		this.contentEl.empty();
	}
}
