import type { PluginSettings } from '@/types';
import manifest from '../../manifest.json';

export function log(settings: PluginSettings, message: string) {
	if (settings.debugMode) console.log(`${manifest.name}:`, message);
}
