import { Modal, Notice, setIcon, setTooltip } from 'obsidian';

import type WordWisePlugin from '@/main';

export default class ErrorDialogModal extends Modal {
	private readonly title: string;
	private readonly message: string;

	constructor(plugin: WordWisePlugin, title: string, message: string | Error) {
		super(plugin.app);
		this.title = title;
		this.message = message instanceof Error ? message.message : message;
	}

	async onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		this.setTitle(this.title);

		const div = contentEl.createDiv();

		let message = this.message || 'Unknown error';

		// If content is JSON, pretty print it
		try {
			const json = JSON.parse(this.message);
			message = JSON.stringify(json, null, 2);
		} catch (_) {
			// Nothing
		}

		// User might type their URL wrongly, if it failed to fetch, rewrite the error message
		if (message.includes('Failed to fetch')) {
			message =
				'Failed to fetch, please check your URL, or internet connection.';
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
