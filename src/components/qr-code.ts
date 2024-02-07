import { PluginSettings } from '@/types';
import { exportQrCodeUri } from '@/utils/settings-sharing';
import { App, Modal, Notice } from 'obsidian';

export class ExportSettingsQrCodeModal extends Modal {
	plugin: PluginSettings;

	constructor(app: App, plugin: PluginSettings) {
		super(app);
		this.plugin = plugin;
	}

	async onOpen() {
		const { contentEl } = this;

		const { rawUri, imgUri } = await exportQrCodeUri(
			this.plugin,
			this.app.vault.getName(),
		);

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

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
