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
	}
}
