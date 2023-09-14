import type { Plugin, SettingTab } from 'obsidian';

interface PluginManifest {
	author?: string;
	authorUrl?: string;
	description?: string;
	dir?: string;
	id?: string;
	isDesktopOnly?: boolean;
	minAppVersion?: string;
	name?: string;
	version?: string;
}

interface SettingTabI extends SettingTab {
	containerEl: HTMLElement;
	id: string;
	name: string;
	navEl: HTMLElement;
	plugin?: Plugin;
}

declare module 'obsidian' {
	interface App {
		setting: {
			close(): Promise<void>;
			open(): Promise<void>;
			openTabById(id: string): Promise<void>;
		};
	}

	interface MenuItem {
		callback: () => void;
		dom: HTMLElement;
		setSubmenu: () => Menu;
		disabled: boolean;
	}
}
