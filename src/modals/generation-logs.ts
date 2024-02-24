import { Modal, Notice } from 'obsidian';

import type WordWisePlugin from '@/main';
import { TextGenerationLog } from '@/types';
import { ForageStorage } from '@/utils/storage';

export default class AddCustomPromptModal extends Modal {
	private enabled: boolean;
	private logs: TextGenerationLog[];
	private page = 1;
	private perPage = 10;
	private readonly plugin: WordWisePlugin;

	// Action sync function or async function
	constructor(plugin: WordWisePlugin) {
		super(plugin.app);
		this.plugin = plugin;
	}

	// Called when the modal is opened
	async initStates() {
		const enabled = this.plugin.settings.enableGenerationLogging;

		this.enabled = enabled;

		if (!enabled) {
			this.logs = [];
			new Notice('Text generation logging is disabled');
			return;
		}

		// Get logs from storage
		this.logs = await new ForageStorage().getTextGenerationLogs();
	}

	onOpen() {
		const { contentEl } = this;

		contentEl.createEl('h2', { text: 'Text Generation Logs' });

		if (!this.enabled) {
			contentEl.createEl('p', {
				text: 'Text generation logging is disabled',
			});
			return;
		}

		if (this.logs.length === 0) {
			contentEl.createEl('p', {
				text: 'No logs found',
			});
			return;
		}

		const displayingLogs = this.logs.slice(
			(this.page - 1) * this.perPage,
			this.page * this.perPage,
		);

		for (const log of displayingLogs) {
			contentEl.createEl('p', {
				text: log.generatedAt,
			});
		}
	}

	async onClose() {
		this.contentEl.empty();
	}
}
