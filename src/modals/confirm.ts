import type { App } from 'obsidian';
import { Modal, Setting } from 'obsidian';

export default class ConfirmModal extends Modal {
	resolve: (value: boolean | PromiseLike<boolean>) => void;
	reject: (reason?: unknown) => void;
	promise: Promise<boolean>;

	// Action sync function or async function
	constructor(app: App) {
		super(app);

		// Create a new Promise that will be resolved when the form is submitted
		this.promise = new Promise((resolve, reject) => {
			this.resolve = resolve;
			this.reject = reject;
		});
	}

	onOpen() {
		const { contentEl } = this;

		contentEl.createEl('h4', { text: 'Are you sure you want to proceed?' });

		contentEl.createEl('p', {
			text: 'This action cannot be undone, please confirm to proceed.',
		});

		new Setting(contentEl)
			.addButton((btn) =>
				btn
					.setButtonText('Confirm')
					.setCta()
					.onClick(async () => {
						this.close();
						this.resolve(true);
					}),
			)
			.addButton((btn) =>
				btn
					.setButtonText('Cancel')
					.setCta()
					.onClick(async () => {
						this.close();
						this.resolve(false);
					}),
			);
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
		this.resolve(false);
	}
}
