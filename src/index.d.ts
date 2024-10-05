import type {} from 'obsidian';

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
