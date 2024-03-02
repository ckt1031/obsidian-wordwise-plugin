import { Modal, Notice } from 'obsidian';

import { CommandNames } from '@/config';
import type WordWisePlugin from '@/main';
import { TextGenerationLog } from '@/types';
import { ForageStorage } from '@/utils/storage';
import dayjs from 'dayjs';
import Fuse from 'fuse.js';

export default class TextGenerationLogModal extends Modal {
	private readonly plugin: WordWisePlugin;

	private forageStore: ForageStorage;

	private enabled: boolean;
	private logs: TextGenerationLog[];

	private textLogDiv: HTMLDivElement;

	// Action sync function or async function
	constructor(plugin: WordWisePlugin) {
		super(plugin.app);
		this.plugin = plugin;

		this.forageStore = new ForageStorage();
		this.textLogDiv = createDiv('scroll-container');
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

	renderLoggDetailView(id: string) {
		const { titleEl, contentEl } = this;

		const log = this.logs.find((l) => l.id === id);

		if (!log) {
			new Notice('Log not found');
			return;
		}

		contentEl.empty();

		titleEl.setText(dayjs(log.generatedAt).format('YYYY-MM-DD HH:mm:ss'));

		// Add a button to go back to the list
		const backButton = contentEl.createEl('button', { text: 'Back to List' });

		backButton.onclick = () => this.renderIndexView();

		// Add delete button
		const deleteButton = contentEl.createEl('button', {
			text: 'Delete Log',
			cls: 'log-delet-button',
		});

		deleteButton.onclick = async () => {
			const confirmText = 'Are you sure?';

			if (deleteButton.textContent !== confirmText) {
				deleteButton.textContent = confirmText;
				return;
			}

			await this.forageStore.deleteSingleTextGenerationLog(id);
			this.logs = this.logs.filter((l) => l.id !== id);
			new Notice('Log deleted');
			this.renderIndexView();
		};

		// Make text in <code> inside p tag

		contentEl.createEl('p', { text: `Model: ${log.model}` });
		contentEl.createEl('p', { text: `Provider: ${log.provider}` });
		contentEl.createEl('p', { text: `Command Name: ${log.by}` });

		// Show Text Custom Instruction if it exists
		if (log.by === CommandNames.CustomInstructions && log.customInstruction) {
			contentEl.createEl('textarea', {
				text: log.customInstruction,
				cls: 'modal-text-area',
				attr: { readonly: true },
			});
		}

		contentEl.createEl('h4', { text: 'Original Text' });

		contentEl.createEl('textarea', {
			text: log.orginalText,
			cls: 'modal-text-area',
			attr: { readonly: true },
		});

		contentEl.createEl('h4', { text: 'Generated Text' });

		contentEl.createEl('textarea', {
			text: log.generatedText,
			cls: 'modal-text-area',
			attr: { readonly: true },
		});
	}

	renderLogList(displayingLogs: TextGenerationLog[]) {
		// Clear the container
		this.textLogDiv.empty();

		// create a scrollable container
		// create a list of logs
		for (const log of displayingLogs) {
			this.textLogDiv.createEl('p', {
				text: dayjs(log.generatedAt).format('YYYY-MM-DD HH:mm:ss'),
				cls: 'log-item',
			}).onclick = () => this.renderLoggDetailView(log.id);
		}
	}

	renderIndexView() {
		const { titleEl, contentEl } = this;

		contentEl.empty();

		titleEl.setText('Text Generation Logs');

		const searchInputBox = contentEl.createEl('input', {
			type: 'text',
			placeholder: 'Search logs...',
			cls: 'log-search-box',
		});

		const displayingLogs = this.logs;

		const fuse = new Fuse(displayingLogs, {
			keys: [
				'id',
				'generatedAt',
				'orginalText',
				'generatedText',
				'customInstruction',
			],
		});

		searchInputBox.onchange = (e) => {
			const queryText = (e.target as HTMLInputElement).value;

			if (queryText === '') {
				this.renderLogList(displayingLogs);
				return;
			}

			const searchResults = fuse.search(queryText);

			this.renderLogList(searchResults.map((r) => r.item));
		};

		this.contentEl.appendChild(this.textLogDiv);

		this.renderLogList(displayingLogs);
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

		this.renderIndexView();
	}

	onClose() {
		this.contentEl.empty();
	}
}
