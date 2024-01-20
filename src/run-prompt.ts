import { App, type Editor, Notice } from 'obsidian';

import AskForInstructionModal from './modals/ask-for-instruction';
import { getCommands } from './prompts';
import {
	CommandActions,
	type CommandNames,
	type PluginSettings,
} from './types';
import { callAPI } from './utils/call-api';
import { log } from './utils/logging';
import { mustacheRender } from './utils/mustache';

export async function runPrompt(
	app: App,
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

	const actionData = getCommands(settings).find((p) => p.name === command);

	if (!actionData) {
		throw new Error(`Could not find prompt data with name ${command}`);
	}

	if (!actionData.data) {
		throw new Error(`Prompt data with name ${command} has no data`);
	}

	let instructions = '';

	if (actionData.action === CommandActions.CustomInstructions) {
		const modal = new AskForInstructionModal(app);
		modal.open();
		instructions = await modal.promise;
		if (!instructions || instructions === '') return;
	}

	new Notice(`Generating text with ${command}...`);

	const prompt: string = mustacheRender(actionData.data, {
		input,
		instructions,
	});

	try {
		const result = await callAPI({
			settings,
			userMessages: prompt,
			enableSystemMessages: true,
		});

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
