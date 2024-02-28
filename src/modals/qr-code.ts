import WordWisePlugin from '@/main';
import { exportQrCodeUri } from '@/utils/settings-sharing';
import { Modal, Notice } from 'obsidian';

export class ExportSettingsQrCodeModal extends Modal {
	plugin: WordWisePlugin;

	constructor(plugin: WordWisePlugin) {
		super(plugin.app);
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

		if (imgUri !== '') {
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
