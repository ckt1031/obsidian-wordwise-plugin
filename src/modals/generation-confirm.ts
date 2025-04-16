import type WordWisePlugin from '@/main';
import { Modal, Notice } from 'obsidian';

export default class GenerationConfirmationModal extends Modal {
	private readonly result: string;
	private readonly onAccept: () => void;

	constructor(plugin: WordWisePlugin, result: string, onAccept: () => void) {
		super(plugin.app);
		this.result = result;
		this.onAccept = onAccept;
	}

	async onOpen() {
		const { contentEl, result } = this;

		contentEl.empty();

		this.setTitle('Generation Confirmation');

		const div = contentEl.createDiv({
			cls: 'code-container',
		});

		// Show error message
		div.createEl('code', {
			text: result,
		});

		const btnContainer = contentEl.createDiv({
			cls: 'button-container',
		});

		// Create accept button
		const acceptBtn = btnContainer.createEl('button', {
			text: 'Accept',
			cls: 'button-padding-right', // Add padding to the right
		});

		const copyBtn = btnContainer.createEl('button', {
			text: 'Copy',
		});

		// Add click event to copy button
		copyBtn.addEventListener('click', () => {
			navigator.clipboard.writeText(result);
			new Notice('Copied to clipboard');
		});

		// Add click event to accept button
		acceptBtn.addEventListener('click', () => {
			this.onAccept();
			this.close();
		});
	}

	onClose() {
		this.contentEl.empty();
		this.contentEl.remove();
	}
}
