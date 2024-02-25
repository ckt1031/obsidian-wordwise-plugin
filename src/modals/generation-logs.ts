import { Modal, Notice } from 'obsidian';

import { CommandNames } from '@/config';
import type WordWisePlugin from '@/main';
import { TextGenerationLog } from '@/types';
import { ForageStorage } from '@/utils/storage';
import dayjs from 'dayjs';

export default class TextGenerationLogModal extends Modal {
	private enabled: boolean;
	private logs: TextGenerationLog[];
	private page = 1;
	private perPage = 10;
	private readonly plugin: WordWisePlugin;

	private forageStore: ForageStorage;

	// Action sync function or async function
	constructor(plugin: WordWisePlugin) {
		super(plugin.app);
		this.plugin = plugin;
		this.forageStore = new ForageStorage();
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
		const logs = await this.forageStore.getTextGenerationLogs();

		// Sort logs by date
		this.logs = logs.sort(
			(a, b) =>
				new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime(),
		);

		this.logs = logs;
	}

	showLog(id: string) {
		const { titleEl, contentEl } = this;
		const log = this.logs.find((l) => l.id === id);

		if (!log) {
			new Notice('Log not found');
			return;
		}

		contentEl.empty();

		titleEl.setText(
			`Log: ${dayjs(log.generatedAt).format('YYYY-MM-DD HH:mm:ss')}`,
		);

		// Add delete button
		const deleteButton = contentEl.createEl('button', { text: 'Delete Log' });

		deleteButton.onclick = async () => {
			await this.forageStore.deleteSingleTextGenerationLog(id);
			this.logs = this.logs.filter((l) => l.id !== id);
			new Notice('Log deleted');
			this.showList();
		};

		contentEl.createEl('p', { text: `Model: ${log.model}` });
		contentEl.createEl('p', { text: `Provider: ${log.provider}` });
		contentEl.createEl('p', { text: `Command Name: ${log.by}` });

		// Show Text Custom Instruction if it exists
		if (log.by === CommandNames.CustomInstructions && log.customInstruction) {
			contentEl.createEl('textarea', {
				text: `Custom Instruction: ${log.customInstruction}`,
				cls: 'modal-text-area',
			});
		}

		contentEl.createEl('h4', { text: 'Original Text' });

		contentEl.createEl('textarea', {
			text: log.orginalText,
			cls: 'modal-text-area',
		});

		contentEl.createEl('h4', { text: 'Generated Text' });

		contentEl.createEl('textarea', {
			text: log.generatedText,
			cls: 'modal-text-area',
		});
	}

	showList() {
		const { titleEl, contentEl } = this;

		this.contentEl.empty();

		titleEl.setText('Text Generation Logs');

		const displayingLogs = this.logs.slice(
			(this.page - 1) * this.perPage,
			this.page * this.perPage,
		);

		// create a scrollable container
		const scrollContainer = contentEl.createDiv('scroll-container');

		// create a list of logs
		for (const log of displayingLogs) {
			scrollContainer.createEl('p', {
				text: dayjs(log.generatedAt).format('YYYY-MM-DD HH:mm:ss'),
				cls: 'log-item',
			}).onclick = () => this.showLog(log.id);
		}
	}

	onOpen() {
		const { contentEl } = this;

		if (!this.enabled) {
			new Notice('Text generation logging is disabled');
			contentEl.empty();
			return;
		}

		if (this.logs.length === 0) {
			contentEl.empty();
			new Notice('No logs found');
			return;
		}

		this.showList();
	}

	onClose() {
		this.contentEl.empty();
	}
}
