import type WordWisePlugin from '@/main';
import { Modal, Setting } from 'obsidian';

export default class ConfirmModal extends Modal {
	// Promise Properties
	private resolve: (value: boolean | PromiseLike<boolean>) => void;
	promise: Promise<boolean>;

	// Action sync function or async function
	constructor(plugin: WordWisePlugin) {
		super(plugin.app);

		// Create a new Promise that will be resolved when the form is submitted
		this.promise = new Promise((resolve) => {
			this.resolve = resolve;
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
						this.resolve(true);
						this.close();
					}),
			)
			.addButton((btn) =>
				btn
					.setButtonText('Cancel')
					.setCta()
					.onClick(async () => {
						this.resolve(false);
						this.close();
					}),
			);
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
		this.resolve(false);
	}
}
