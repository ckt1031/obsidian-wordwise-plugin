import { Modal, Notice } from 'obsidian';

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import Fuse from 'fuse.js';

import { InternalPromptNames } from '@/config';
import type WordWisePlugin from '@/main';
import type { TextGenerationLog } from '@/types';
import { ForageStorage } from '@/utils/storage';

dayjs.extend(relativeTime);

/**
 * To introduce some advanced html fragments.
 *
 * Source: https://stackoverflow.com/questions/19929641/how-to-append-an-html-string-to-a-documentfragment
 *
 * Ref: https://github.com/remotely-save/remotely-save/blob/master/src/misc.ts
 * @param string
 * @returns
 */
const stringToFragment = (string: string) => {
	const wrapper = document.createElement('template');
	wrapper.innerHTML = string;
	return wrapper.content;
};

export default class TextGenerationLogModal extends Modal {
	private readonly plugin: WordWisePlugin;

	private readonly forageStore: ForageStorage;

	private enabled: boolean;
	private logs: TextGenerationLog[];

	private readonly textLogDiv: HTMLDivElement;

	// Action sync function or async function
	constructor(plugin: WordWisePlugin) {
		super(plugin.app);
		this.plugin = plugin;

		this.forageStore = new ForageStorage();
		this.textLogDiv = createDiv('scroll-container');
	}

	// Called when the modal is opened
	async initStates() {
		this.enabled = this.plugin.settings.enableGenerationLogging;

		if (!this.enabled) {
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
		const { contentEl } = this;

		const log = this.logs.find((l) => l.id === id);

		if (!log) {
			new Notice('Log not found');
			return;
		}

		contentEl.empty();

		const djsObject = dayjs(log.generatedAt);
		this.setTitle(djsObject.format('YYYY-MM-DD HH:mm:ss'));

		const buttonContainer = contentEl.createDiv();

		// Add a button to go back to the list
		const backButton = buttonContainer.createEl('button', {
			text: 'Back to List',
		});

		backButton.onclick = () => this.renderIndexView();

		// Add delete button
		const deleteButton = buttonContainer.createEl('button', {
			text: 'Delete Log',
			cls: 'log-delete-button',
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

		const metaData = `Generated <strong>${djsObject.fromNow()}</strong></br>Model: <code>${log.model}</code></br>Provider: <code>${log.provider}</code></br>Prompt name: <code>${log.by}</code>`;
		contentEl.createEl('p', { text: stringToFragment(metaData) });

		// Show Text Custom Instruction if it exists
		if (
			log.by === InternalPromptNames.CustomInstructions &&
			log.customInstruction
		) {
			contentEl.createEl('textarea', {
				text: log.customInstruction,
				cls: 'modal-text-area',
				attr: { readonly: true },
			});
		}

		contentEl.createEl('h4', { text: 'Original Text' });

		contentEl.createEl('textarea', {
			text: log.originalText,
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

		for (const log of displayingLogs) {
			const djsObject = dayjs(log.generatedAt);
			const strDate = djsObject.format('YYYY-MM-DD HH:mm:ss');
			const timeFromNow = djsObject.fromNow(true /** without ago suffix */);

			this.textLogDiv.createEl('p', {
				text: `${strDate} (${timeFromNow})`,
				cls: 'log-item',
			}).onclick = () => this.renderLoggDetailView(log.id);
		}
	}

	renderIndexView() {
		const { contentEl } = this;

		contentEl.empty();

		this.setTitle('Text Generation Logs');

		const searchInputBox = contentEl.createEl('input', {
			type: 'text',
			placeholder: 'Search logs...',
			cls: 'log-search-box',
		});

		const fuse = new Fuse(this.logs, {
			keys: [
				'id',
				'generatedAt',
				'original',
				'generatedText',
				'customInstruction',
			],
		});

		searchInputBox.onchange = (e) => {
			const queryText = (e.target as HTMLInputElement).value;

			if (queryText === '') {
				this.renderLogList(this.logs);
				return;
			}

			const searchResults = fuse.search(queryText);

			this.renderLogList(searchResults.map((r) => r.item));
		};

		this.contentEl.appendChild(this.textLogDiv);

		this.renderLogList(this.logs);
	}

	onOpen() {
		const { contentEl } = this;

		this.setTitle('Text Generation Logs');

		if (!this.enabled) {
			contentEl.empty();
			contentEl.setText('Text generation logging is disabled');
			return;
		}

		if (this.logs.length === 0) {
			contentEl.empty();
			contentEl.setText('No logs found');
			return;
		}

		this.renderIndexView();
	}

	onClose() {
		this.contentEl.empty();
	}
}
