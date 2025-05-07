import { Modal, Notice } from 'obsidian';

import type WordWisePlugin from '@/main';
import { removeThinkingContent } from '@/utils/handle-command';

export default class GenerationConfirmationModal extends Modal {
	private result = '';
	private promptName = '';
	private resultEl: HTMLElement;
	private copyAllBtn: HTMLButtonElement;
	private acceptBtnEl: HTMLButtonElement;
	private btnContainer: HTMLElement;

	private plugin: WordWisePlugin;
	private onAccept: (text: string) => void;
	private isStreaming: boolean;
	private isStreamingCompleted = false;

	constructor(
		plugin: WordWisePlugin,
		promptName: string,
		onAccept: (text: string) => void,
		isStreaming = false,
	) {
		super(plugin.app);
		this.plugin = plugin;
		this.promptName = promptName;
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

	onError(errorMessage: string) {
		this.setResult(errorMessage);

		const acceptBtn = this.btnContainer.querySelector(
			'#wd-accept-btn',
		) as HTMLButtonElement;

		if (acceptBtn) acceptBtn.style.display = 'none';
	}

	setStreamingCompleted() {
		this.isStreamingCompleted = true;
		this.acceptBtnEl.disabled = false;
		this.acceptBtnEl.textContent = 'Accept';

		if (this.checkThinkingContentExists()) {
			this.copyAllBtn.style = '';
		}
	}

	checkThinkingContentExists(): boolean {
		// <think>...</think>...
		const regex1 = /^<think>[^<]+<\/think>[^<]+/;
		const regex2 = /^\n<think>[^<]+<\/think>[^<]+/;

		return regex1.test(this.result) || regex2.test(this.result);
	}

	async onOpen() {
		this.contentEl.empty();

		this.setTitle('Generation Confirmation');

		const metaDiv = this.contentEl.createDiv();

		// Show prompt name
		metaDiv.createEl('p', {
			text: `Prompt: ${this.promptName}`,
		});

		const div = this.contentEl.createDiv({
			cls: 'code-container',
		});

		// Show error message
		this.resultEl = div.createEl('code', {
			text: this.result || (this.isStreaming ? 'Generating...' : 'No result'),
			attr: {
				// Make sure new lines are preserved, but scrollable if too long
				disabled: !this.result || this.result.length === 0,
			},
		});

		this.btnContainer = this.contentEl.createDiv({
			cls: 'button-container',
		});

		// Create accept button
		this.acceptBtnEl = this.btnContainer.createEl('button', {
			attr: {
				id: 'wd-accept-btn',
			},
			text: this.isStreaming ? 'Generating' : 'Accept',
			cls: 'button-padding-right', // Add padding to the right
		});
		this.acceptBtnEl.disabled = this.isStreaming;

		const copyBtn = this.btnContainer.createEl('button', {
			text: 'Copy',
			cls: 'button-padding-right', // Add padding to the right
		});

		this.copyAllBtn = this.btnContainer.createEl('button', {
			text: 'Copy All',
			attr: {
				style: 'display: none;',
			},
		});

		this.copyAllBtn.addEventListener('click', () => {
			if (!this.result || this.result.length === 0) {
				new Notice('Nothing to copy');
				return;
			}

			navigator.clipboard.writeText(this.result);
			new Notice('Copied to clipboard');
		});

		// Add click event to copy button
		copyBtn.addEventListener('click', () => {
			if (!this.result || this.result.length === 0) {
				new Notice('Nothing to copy');
				return;
			}

			navigator.clipboard.writeText(removeThinkingContent(this.result));
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
