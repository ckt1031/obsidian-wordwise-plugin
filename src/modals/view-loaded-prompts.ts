import { getIcon, Modal, Setting } from 'obsidian';

import type WordWisePlugin from '@/main';
import { retrieveAllPrompts } from '@/prompt';
import type { OutputInternalPromptProps } from '@/types';

// Extended type to include the disabled property that's actually returned by retrieveAllPrompts
interface ExtendedPromptProps extends OutputInternalPromptProps {
	disabled: boolean;
}

export default class ViewLoadedPromptsModal extends Modal {
	private readonly plugin: WordWisePlugin;
	private searchTerm: string = '';
	private showDisabled: boolean = false;
	private allPrompts: ExtendedPromptProps[] = [];
	private filteredPrompts: ExtendedPromptProps[] = [];

	constructor(plugin: WordWisePlugin) {
		super(plugin.app);
		this.plugin = plugin;
	}

	async onOpen() {
		const { contentEl } = this;

		contentEl.empty();
		this.setTitle('Loaded Prompts');

		// Load all prompts (including disabled ones)
		this.allPrompts = (await retrieveAllPrompts(
			this.plugin,
			false,
		)) as ExtendedPromptProps[];
		this.filteredPrompts = [...this.allPrompts].filter((p) => {
			if (this.showDisabled) return true;
			return !p.disabled;
		});

		// Search box
		new Setting(contentEl)
			.setName('Search Prompts')
			.setDesc('Filter prompts by name or content')
			.addText((text) => {
				text.setPlaceholder('Search...');
				text.onChange((value) => {
					this.searchTerm = value.toLowerCase();
					this.filterPrompts();
					this.renderPrompts();
				});
			});

		new Setting(contentEl).setName('Show Disabled').addToggle((toggle) => {
			toggle.setValue(false);
			toggle.onChange((value) => {
				this.showDisabled = value;
				this.filterPrompts();
				this.renderPrompts();
			});
		});

		// Stats
		const statsDiv = contentEl.createDiv('prompt-stats');
		this.updateStats(statsDiv);

		// Prompts container
		const promptsContainer = contentEl.createDiv('prompts-container');
		this.renderPrompts(promptsContainer);
	}

	private filterPrompts() {
		const _p = this.allPrompts.filter((p) => {
			if (this.showDisabled) return true;
			return !p.disabled;
		});

		if (!this.searchTerm) {
			this.filteredPrompts = [..._p];
		} else {
			this.filteredPrompts = _p.filter((prompt) => {
				const nameMatch = prompt.name.toLowerCase().includes(this.searchTerm);
				const taskMatch = prompt.taskPrompt
					?.toLowerCase()
					.includes(this.searchTerm);
				const systemMatch = prompt.systemPrompt
					?.toLowerCase()
					.includes(this.searchTerm);
				return nameMatch || taskMatch || systemMatch;
			});
		}
	}

	private updateStats(container: HTMLElement) {
		container.empty();
		const total = this.allPrompts.length;
		const enabled = this.allPrompts.filter((p) => !p.disabled).length;
		const disabled = total - enabled;

		container.innerHTML = `
			<div class="prompt-stats-grid">
				<div class="stat-item">
					<span class="stat-label">Total:</span>
					<span class="stat-value">${total}</span>
				</div>
				<div class="stat-item">
					<span class="stat-label">Enabled:</span>
					<span class="stat-value enabled">${enabled}</span>
				</div>
				<div class="stat-item">
					<span class="stat-label">Disabled:</span>
					<span class="stat-value disabled">${disabled}</span>
				</div>
			</div>
		`;
	}

	private renderPrompts(container?: HTMLElement) {
		const targetContainer =
			container || this.contentEl.querySelector('.prompts-container');
		if (!targetContainer) return;

		targetContainer.empty();

		if (this.filteredPrompts.length === 0) {
			targetContainer.createEl('p', {
				text: this.searchTerm
					? 'No prompts match your search.'
					: 'No prompts found.',
				cls: 'no-prompts-message',
			});
			return;
		}

		// Create scrollable container
		const scrollContainer = targetContainer.createDiv({
			cls: 'prompts-scroll-container',
			attr: {
				style: 'display: flex; flex-direction: column; gap: 10px;',
			},
		});

		// Sort prompts by disabled status and then by name
		const sortedPrompts = this.filteredPrompts.sort((a, b) => {
			if (a.disabled && !b.disabled) return 1;
			if (!a.disabled && b.disabled) return -1;
			return a.name.localeCompare(b.name);
		});

		for (const prompt of sortedPrompts) {
			const promptDiv = scrollContainer.createDiv('prompt-item');
			promptDiv.addClass(
				prompt.disabled ? 'prompt-disabled' : 'prompt-enabled',
			);

			// Prompt header
			const headerDiv = promptDiv.createDiv('prompt-header');

			// Icon and name
			const nameDiv = headerDiv.createDiv('prompt-name');
			if (prompt.icon) {
				const icon = getIcon(prompt.icon);

				if (icon) {
					// Add this as SVG to the nameDiv
					nameDiv.innerHTML = icon.outerHTML;
				}
			}
			nameDiv.createEl('span', {
				text: prompt.name,
				cls: 'prompt-title',
			});

			// Status badge
			// If only showing enabled prompts, there is no need to show redundant "Enabled" things
			if (this.showDisabled) {
				const statusDiv = headerDiv.createDiv('prompt-status');
				statusDiv.createEl('span', {
					text: prompt.disabled ? 'Disabled' : 'Enabled',
					cls: `status-badge ${prompt.disabled ? 'status-disabled' : 'status-enabled'}`,
				});
			}

			// Type badge
			const typeDiv = headerDiv.createDiv('prompt-type');
			let typeText = 'Custom';
			if (prompt.isFilePrompt) {
				typeText = 'File';
			} else if (!prompt.filePath) {
				typeText = 'Internal';
			}
			typeDiv.createEl('span', {
				text: typeText,
				cls: `type-badge type-${typeText.toLowerCase()}`,
			});

			// Preview content
			const previewDiv = promptDiv.createDiv('prompt-preview');
			const previewText = prompt.taskPrompt || 'No task prompt defined';
			previewDiv.createEl('p', {
				text:
					previewText.length > 250
						? `${previewText.slice(0, 250)}...`
						: previewText,
				cls: 'preview-text',
			});

			// Action button
			const actionDiv = promptDiv.createDiv('prompt-actions');
			new Setting(actionDiv).addButton((button) => {
				button.setButtonText('View Details');
				button.setCta();
				button.onClick(() => {
					this.showPromptDetails(prompt);
				});
			});
		}

		// Update stats
		const statsContainer = this.contentEl.querySelector(
			'.prompt-stats',
		) as HTMLElement;
		if (statsContainer) {
			this.updateStats(statsContainer);
		}
	}

	private showPromptDetails(prompt: ExtendedPromptProps) {
		const detailModal = new PromptDetailModal(this.plugin, prompt);
		detailModal.open();
	}

	onClose() {
		this.contentEl.empty();
	}
}

class PromptDetailModal extends Modal {
	private readonly prompt: ExtendedPromptProps;

	constructor(plugin: WordWisePlugin, prompt: ExtendedPromptProps) {
		super(plugin.app);
		this.prompt = prompt;
	}

	onOpen() {
		const { contentEl } = this;
		const { prompt } = this;

		contentEl.empty();
		this.setTitle('Prompt Details');

		// Header with icon and status
		const headerDiv = contentEl.createDiv('prompt-detail-header');

		if (prompt.icon) {
			const icon = getIcon(prompt.icon);

			if (icon) {
				icon.style.width = '28px';
				icon.style.height = '28px';
				headerDiv.innerHTML = icon.outerHTML;
			}
		}

		const titleDiv = headerDiv.createDiv('prompt-detail-title');
		titleDiv.createEl('h3', { text: prompt.name });

		const statusDiv = headerDiv.createDiv('prompt-detail-status');
		statusDiv.createEl('span', {
			text: prompt.disabled ? 'Disabled' : 'Enabled',
			cls: `status-badge ${prompt.disabled ? 'status-disabled' : 'status-enabled'}`,
		});

		// Information grid
		const infoGrid = contentEl.createDiv('prompt-info-grid');

		// Basic info
		const basicInfo = infoGrid.createDiv('info-section');
		basicInfo.createEl('h4', { text: 'Basic Information' });

		this.createInfoRow(
			basicInfo,
			'Type',
			prompt.isFilePrompt
				? 'File-based'
				: prompt.filePath
					? 'Custom'
					: 'Internal',
		);

		// Only show this for file-based prompts
		if (prompt.filePath) {
			this.createInfoRow(basicInfo, 'File Path', prompt.filePath);
		}

		// Custom settings
		const customInfo = infoGrid.createDiv('info-section');
		customInfo.createEl('h4', { text: 'Custom Settings' });

		this.createInfoRow(
			customInfo,
			'Behavior',
			prompt.customBehavior || 'Inherit from settings',
		);
		this.createInfoRow(
			customInfo,
			'Provider',
			prompt.customPromptDefinedProvider || 'Inherit from settings',
		);
		this.createInfoRow(
			customInfo,
			'Model',
			prompt.customPromptDefinedModel || 'Inherit from settings',
		);

		// Task Prompt
		const taskSection = contentEl.createDiv('prompt-section');
		taskSection.createEl('h4', { text: 'Task Prompt' });

		if (prompt.taskPrompt) {
			const taskTextarea = taskSection.createEl('textarea', {
				attr: {
					readonly: true,
					rows: Math.min(10, prompt.taskPrompt.split('\n').length + 2),
				},
				cls: 'prompt-textarea',
			});
			taskTextarea.value = prompt.taskPrompt;
		} else {
			taskSection.createEl('p', {
				text: 'No task prompt defined',
				cls: 'no-content-message',
			});
		}

		// System Prompt
		const systemSection = contentEl.createDiv('prompt-section');
		systemSection.createEl('h4', { text: 'System Prompt' });

		if (prompt.systemPrompt) {
			const systemTextarea = systemSection.createEl('textarea', {
				attr: {
					readonly: true,
					rows: Math.min(8, prompt.systemPrompt.split('\n').length + 2),
				},
				cls: 'prompt-textarea',
			});
			systemTextarea.value = prompt.systemPrompt;
		} else {
			systemSection.createEl('p', {
				text: 'No system prompt defined',
				cls: 'no-content-message',
			});
		}
	}

	private createInfoRow(container: HTMLElement, label: string, value: string) {
		const row = container.createDiv('info-row');
		row.createEl('span', {
			text: `${label}:`,
			cls: 'info-label',
		});
		row.createEl('span', {
			text: value,
			cls: 'info-value',
		});
	}

	onClose() {
		this.contentEl.empty();
	}
}
