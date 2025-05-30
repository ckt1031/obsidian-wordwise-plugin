import 'obsidian';

declare module 'obsidian' {
	interface App {
		appId: string;
		commands: {
			commands: Record<
				string,
				{
					id: string;
					name: string;
					icon?: string;
				}
			>;
		};
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
