import { PluginSettingTab } from 'obsidian';

import type WordWisePlugin from '../main';
import { ForageStorage } from '../utils/storage';
import { renderAdvancedSettings } from './advanced';
import { renderBehaviorSettings } from './behavior';
import { renderCustomPromptSettings } from './custom-prompts';
import { renderDangerZoneSettings } from './danger-zone';
import { renderLoggingSettings } from './logging';
import { renderProviderSettings } from './provider';

export class SettingsTab extends PluginSettingTab {
	readonly plugin: WordWisePlugin;
	readonly forage: ForageStorage;

	constructor(plugin: WordWisePlugin) {
		super(plugin.app, plugin);
		this.plugin = plugin;
		this.forage = new ForageStorage();
	}

	display(): void {
		this.containerEl.empty();

		renderProviderSettings(this);
		renderBehaviorSettings(this);
		renderAdvancedSettings(this);
		renderCustomPromptSettings(this);
		renderLoggingSettings(this);
		renderDangerZoneSettings(this);
	}
}
