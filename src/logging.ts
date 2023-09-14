import manifest from '../manifest.json';
import type { PluginSettings } from './types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function log(settings: PluginSettings, message: string) {
	if (settings.debugMode) console.log(manifest.name + ':', message);
}
