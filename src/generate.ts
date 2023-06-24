// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import Mustache from 'mustache';
import { type Editor, Notice } from 'obsidian';

import { callAPI } from './ai';
import { log } from './logging';
import type { CommandNames } from './prompts';
import { PROMPTS } from './prompts';
import type { PluginSettings } from './types';

export async function runPrompts(editor: Editor, settings: PluginSettings, command: CommandNames) {
	if (!settings.openAiApiKey || settings.openAiApiKey === '') {
		new Notice('No OpenAI API key set');
		return;
	}

	log(settings, `Running prompt with command ${command}`);

	const input = editor.getSelection();

	if (input.length > 0) {
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		const promptData = PROMPTS.find(p => p.name === command);

		if (!promptData) throw new Error(`Could not find prompt data with name ${command}`);

		const prompt: string = Mustache.render(promptData.description, {
			input,
		});

		const result = await callAPI(settings, prompt);

		if (result) {
			editor.replaceSelection(result);

			log(settings, `Replaced selection with result: ${result}`);
		}
	}
}
