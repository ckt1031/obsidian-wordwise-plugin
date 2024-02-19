import WordWisePlugin from '@/main';

export function log(
	{ settings, manifest }: WordWisePlugin,
	message: string | Error,
) {
	if (settings.debugMode) console.log(manifest.name, message);
}
