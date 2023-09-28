import { Notice } from 'obsidian';
import type { PluginSettings } from 'src/types';

export function checkAPIKey(settings: PluginSettings) {
	const isOfficialAPI =
		settings.openAiBaseUrl === '' ||
		settings.openAiBaseUrl === 'api.openai.com' ||
		settings.openAiBaseUrl === 'https://api.openai.com';

	const hasNoAPIKey = !settings.openAiApiKey || settings.openAiApiKey === '';

	if (isOfficialAPI && hasNoAPIKey) {
		new Notice('No OpenAI API key set');
		return false;
	}

	return true;
}
