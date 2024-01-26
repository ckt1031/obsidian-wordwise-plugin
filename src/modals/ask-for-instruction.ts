import type { App, TextAreaComponent } from 'obsidian';
import { Modal, Notice, Setting } from 'obsidian';

export default class AskForInstructionModal extends Modal {
	instruction: string;
	app: App;
	resolve: (value: string | PromiseLike<string>) => void;
	reject: (reason?: unknown) => void;
	promise: Promise<string>;

	constructor(app: App) {
		super(app);
		this.instruction = '';

		// Create a new Promise that will be resolved when the form is submitted
		this.promise = new Promise((resolve, reject) => {
			this.resolve = resolve;
			this.reject = reject;
		});
	}

	async submitForm(): Promise<void> {
		if (this.instruction === '') {
			new Notice('Please fill out all fields');
			this.reject('Instruction field is empty');
			return;
		}

		this.resolve(this.instruction);
		this.close();
	}

	onOpen() {
		const { contentEl, instruction } = this;

		contentEl.createEl('h4', { text: 'Enter custom instruction here:' });

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
