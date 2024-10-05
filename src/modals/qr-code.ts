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

		const { rawUri, imgUri, encodedDataString } =
			await new SettingsExportImport(this.plugin).exportQrCodeUri();

		const div1 = contentEl.createDiv();
		div1.createEl('p', {
			text: 'Scan the QR code with your mobile device to import the settings',
		});

		const div2 = contentEl.createDiv();

		div2.createEl(
			'button',
			{
				text: 'Copy URI',
			},
			(el) => {
				el.onclick = async () => {
					await navigator.clipboard.writeText(rawUri);
					new Notice('URI copied to clipboard');
				};
			},
		);

		// Copy Data string
		div2.createEl(
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

		if (imgUri && imgUri.length > 0) {
			const div3 = contentEl.createDiv();
			div3.createEl(
				'img',
				{
					cls: 'qrcode-img',
				},
				async (el) => {
					el.src = imgUri;
				},
			);
		}
	}

	onClose() {
		this.contentEl.empty();
	}
}
