import type WordWisePlugin from '@/main';
import { Modal, Notice } from 'obsidian';

export default class GenerationConfirmationModal extends Modal {
	private result = '';
	private resultEl: HTMLElement;
	private acceptBtnEl: HTMLButtonElement;

	private plugin: WordWisePlugin;
	private onAccept: (text: string) => void;
	private isStreaming: boolean;
	private isStreamingCompleted = false;

	constructor(
		plugin: WordWisePlugin,
		onAccept: (text: string) => void,
		isStreaming = false,
	) {
		super(plugin.app);
		this.plugin = plugin;
		this.onAccept = onAccept;
		this.isStreaming = isStreaming;
	}

	setResult(result: string) {
		this.result = result;
		this.resultEl.setText(result);
	}

	appendResult(result: string) {
		this.result = this.result + result;
		this.resultEl.setText(this.result);
	}

	setStreamingCompleted() {
		this.isStreamingCompleted = true;
		this.acceptBtnEl.disabled = false;
		this.acceptBtnEl.textContent = 'Accept';
	}

	async onOpen() {
		this.contentEl.empty();

		this.setTitle('Generation Confirmation');

		const div = this.contentEl.createDiv({
			cls: 'code-container',
		});

		// Show error message
		this.resultEl = div.createEl('code', {
			text: this.result,
		});

		const btnContainer = this.contentEl.createDiv({
			cls: 'button-container',
		});

		// Create accept button
		this.acceptBtnEl = btnContainer.createEl('button', {
			text: this.isStreaming ? 'Generating' : 'Accept',
			cls: 'button-padding-right', // Add padding to the right
		});
		this.acceptBtnEl.disabled = this.isStreaming;

		const copyBtn = btnContainer.createEl('button', {
			text: 'Copy',
		});

		// Add click event to copy button
		copyBtn.addEventListener('click', () => {
			navigator.clipboard.writeText(this.result);
			new Notice('Copied to clipboard');
		});

		// Add click event to accept button
		this.acceptBtnEl.addEventListener('click', () => {
			this.onAccept(this.resultEl.getText());
			this.close();
		});
	}

	onClose() {
		this.contentEl.empty();
		this.contentEl.remove();

		// If the modal is closed while streaming, we need to abort the request
		if (
			this.isStreaming &&
			!this.isStreamingCompleted &&
			this.plugin.generationRequestAbortController
		) {
			// Cancel the request
			this.plugin.generationRequestAbortController.abort();
			this.plugin.updateStatusBar();
		}
	}
}
