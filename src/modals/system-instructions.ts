import { Modal } from 'obsidian';

import type WordWisePlugin from '@/main';
import {
	excludeOriginalText,
	systemBasePrompt,
	withOriginalText,
} from '@/prompts/system';

export default class SystemInstructionsModal extends Modal {
	constructor(plugin: WordWisePlugin) {
		super(plugin.app);
	}

	onOpen() {
		const { contentEl } = this;

		contentEl.empty();
		this.setTitle('System Instructions');

		contentEl.createEl('p', {
			text: 'System instructions are used to guide AI text generation. They are applied to all text generation tasks.',
		});

		const section = contentEl.createDiv('info-section');
		section.createEl('h4', { text: 'Base System Prompt' });

		section.createEl('textarea', {
			cls: 'prompt-textarea',
			attr: {
				disabled: true,
				rows: 5,
				style:
					'white-space: pre-wrap; overflow-wrap: break-word; width: 100%; max-width: 100%; max-height: 300px;',
			},
			text: systemBasePrompt.trim(),
		});

		// Exclude Original Text
		section.createEl('h4', {
			text: 'Exclude Original Text Instructions',
			attr: {
				style: 'margin-top: 10px;',
			},
		});

		section.createEl('textarea', {
			cls: 'prompt-textarea',
			attr: {
				disabled: true,
				rows: 5,
				style:
					'white-space: pre-wrap; overflow-wrap: break-word; width: 100%; max-width: 100%; max-height: 300px;',
			},
			text: excludeOriginalText.trim(),
		});

		// With Original Text
		section.createEl('h4', {
			text: 'With Original Text Instructions',
			attr: {
				style: 'margin-top: 10px;',
			},
		});

		section.createEl('textarea', {
			cls: 'prompt-textarea',
			attr: {
				disabled: true,
				rows: 5,
				style:
					'white-space: pre-wrap; overflow-wrap: break-word; width: 100%; max-width: 100%; max-height: 300px;',
			},
			text: withOriginalText.trim(),
		});
	}

	onClose() {
		this.contentEl.empty();
	}
}
