import type { App, TextComponent } from 'obsidian';
import { Modal, Notice, Setting } from 'obsidian';

export default class AskForInstructionModal extends Modal {
	instruction: string;
	app: App;
	resolve: (value: string | PromiseLike<string>) => void;
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	reject: (reason?: any) => void;
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

		new Setting(contentEl).setName('Name:').addText((text: TextComponent) => {
			text.setPlaceholder('Instruction');
			text.onChange((value: string) => {
				this.instruction = value;
			});
			text.setValue(instruction);
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
