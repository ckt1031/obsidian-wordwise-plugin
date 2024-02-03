import { App, type Editor, Notice } from 'obsidian';

import Mustache from 'mustache';
import AskForInstructionModal from './modals/ask-for-instruction';
import { getCommands } from './prompts';
import {
	CommandActions,
	type CommandNames,
	type PluginSettings,
} from './types';
import { callAPI } from './utils/call-api';
import { log } from './utils/logging';

export async function runCommand(
	app: App,
	editor: Editor,
	settings: PluginSettings,
	command: CommandNames | string,
) {
	try {
		const input = editor.getSelection();

		if (input.length === 0) {
			new Notice('No input selected');
			return;
		}

		log(settings, `Running command: ${command}`);

		const actionData = getCommands(settings).find((p) => p.name === command);

		if (!actionData) {
			throw new Error(`Could not find command data with name ${command}`);
		}

		if (!actionData.data) {
			throw new Error(`Command data with name ${command} has no data`);
		}

		let instructions = '';

		if (actionData.action === CommandActions.CustomInstructions) {
			const modal = new AskForInstructionModal(app);
			modal.open();
			instructions = await modal.promise;
			if (!instructions || instructions === '') return;
		}

		new Notice(`Generating text with ${command}...`);

		const userMessage: string = Mustache.render(actionData.data, {
			input,
			instructions,
		});

		const result = await callAPI({
			settings,
			userMessage,
		});

		if (!result) {
			new Notice('No result from AI service.');
			return;
		}

		editor.replaceSelection(result);

		log(settings, `Replaced selection with result: ${result}`);

		new Notice('Text generated.');
	} catch (error) {
		if (error instanceof Error) {
			log(this.settings, error.message);
			new Notice(
				error.message.length > 100
					? 'Error generating text, see console for details'
					: `Error generating text: ${error.message}`,
			);
		}
	}
}
