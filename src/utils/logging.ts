import WordWisePlugin from '@/main';

export function log(plugin: WordWisePlugin, message: string) {
	if (plugin.settings?.debugMode) console.log(plugin.manifest.name, message);
}
