import type WordWisePlugin from '@/main';

export function log({ settings, manifest }: WordWisePlugin, message: unknown) {
	if (settings.debugMode) console.log(`${manifest.name}:`, message);
}
