import { type Editor, Notice } from 'obsidian';

import { callAPI } from './ai';
import { log } from './logging';
import { mustacheRender } from './mustache';
import { getPrompts } from './prompts';
import type { CommandNames, PluginSettings } from './types';

export async function runPrompts(
	editor: Editor,
	settings: PluginSettings,
	command: CommandNames | string,
) {
	const input = editor.getSelection();

	if (input.length === 0) {
		new Notice('No input selected');
		return;
	}

	log(settings, `Running prompt with command ${command}`);

	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	const promptData = getPrompts(settings).find(p => p.name === command);

	if (!promptData) throw new Error(`Could not find prompt data with name ${command}`);

	new Notice(`Generating text with ${command}...`);

	const prompt: string = mustacheRender(promptData.data, {
		input,
	});

	try {
		const result = await callAPI(settings, prompt);

		if (!result) {
			new Notice('No result from OpenAI');
			return;
		}

		editor.replaceSelection(result);

		log(settings, `Replaced selection with result: ${result}`);

		new Notice('Text generated.');
	} catch (error) {
		if (error instanceof Error) {
			log(settings, error.message);
			new Notice(`Error requesting OpenAI: ${error.message}`);
			return undefined;
		}
	}
}
