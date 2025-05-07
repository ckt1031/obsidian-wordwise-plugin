import type { TextAreaComponent } from 'obsidian';
import { Modal, Setting } from 'obsidian';

import type WordWisePlugin from '@/main';

export default class AskForInstructionModal extends Modal {
	private instruction: string;

	// Promise Properties
	private resolve: (value: string | PromiseLike<string>) => void;
	private reject: (reason?: unknown) => void;
	promise: Promise<string>;

	constructor(plugin: WordWisePlugin) {
		super(plugin.app);
		this.instruction = '';

		// Create a new Promise that will be resolved when the form is submitted
		this.promise = new Promise((resolve, reject) => {
			this.resolve = resolve;
			this.reject = reject;
		});
	}

	async submitForm(): Promise<void> {
		if (this.instruction === '') {
			this.reject('Instruction field is empty');
			return;
		}

		this.resolve(this.instruction);
		this.close();
	}

	onOpen() {
		const { contentEl, instruction } = this;
		contentEl.empty();
		this.setTitle('Enter custom instruction here:');

		new Setting(contentEl)
			.setName('Instruction:')
			.addTextArea((textArea: TextAreaComponent) => {
				textArea.inputEl.className = 'modal-text-area';
				textArea.setPlaceholder(
					'Help me to transform bullets into numbered lists.',
				);
				textArea.onChange((value: string) => {
					this.instruction = value;
				});
				textArea.setValue(instruction);
			});

		new Setting(contentEl).addButton((btn) =>
			btn
				.setButtonText('Confirm')
				.setCta()
				.onClick(async () => {
					await this.submitForm();
				}),
		);
	}

	onClose() {
		this.contentEl.empty();
		this.resolve('');
	}
}
