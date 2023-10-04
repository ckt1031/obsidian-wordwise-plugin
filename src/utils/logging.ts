import manifest from '../../manifest.json';
import type { PluginSettings } from '../types';

export function log(settings: PluginSettings, message: string) {
	if (settings.debugMode) console.log(manifest.name + ':', message);
}
