import type WordWisePlugin from '@/main';
import { Modal, Notice, setIcon, setTooltip } from 'obsidian';

export default class ErrorDialogModal extends Modal {
	private readonly title: string;
	private readonly message: string;

	constructor(plugin: WordWisePlugin, title: string, message: string) {
		super(plugin.app);
		this.title = title;
		this.message = message;
	}

	async onOpen() {
		const { contentEl } = this;

		contentEl.createEl('h4', { text: this.title });

		const div = contentEl.createDiv();

		let message = this.message;

		// If content is JSON, pretty print it
		try {
			const json = JSON.parse(this.message);
			message = JSON.stringify(json, null, 2);
		} catch (e) {
			// Not JSON
		}

		// Show error message
		div.createEl('code', {
			text: message,
			attr: {
				// Make sure new lines are preserved, but scrollable if too long
				style: 'white-space: pre-wrap; overflow: auto; max-height: 300px;',
			},
		});

		const buttonDiv = div.createDiv({
			attr: {
				class: 'button-container',
			},
		});

		// Show copy button
		const copyButton = buttonDiv.createEl('button', {
			text: 'Copy',
		});
		copyButton.addEventListener('click', () => {
			navigator.clipboard.writeText(this.message);
			new Notice('Copied to clipboard');
		});
		setIcon(copyButton, 'copy');
		setTooltip(copyButton, 'Copy error message');
	}

	onClose() {
		this.contentEl.empty();
	}
}
