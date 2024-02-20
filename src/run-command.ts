import { App, type Editor, Notice } from 'obsidian';

import Mustache from 'mustache';
import WordWisePlugin from './main';
import AskForInstructionModal from './modals/ask-for-instruction';
import { getCommands } from './prompts';
import { CommandActions, type CommandNames } from './types';
import { callAPI } from './utils/call-api';
import { log } from './utils/logging';

export async function runCommand(
	app: App,
	editor: Editor,
	plugin: WordWisePlugin,
	command: CommandNames | string,
) {
	try {
		const input = editor.getSelection();

		if (input.length === 0) {
			new Notice('No input selected');
			return;
		}

		log(plugin, `Running command: ${command}`);

		const actionData = getCommands(plugin.settings).find(
			(p) => p.name === command,
		);

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

		new Notice(`Generating text with ${command} (${plugin.settings.aiProvider})...`);

		const userMessage: string = Mustache.render(actionData.data, {
			input,
			instructions,
		});

		const result = await callAPI({
			plugin,
			userMessage,
		});

		if (!result) {
			new Notice('No result from AI service.');
			return;
		}

		editor.replaceSelection(result);

		log(plugin, `Replaced selection with result: ${result}`);

		new Notice('Text generated.');
	} catch (error) {
		if (error instanceof Error) {
			log(plugin, error);
			new Notice(
				error.message.length > 100
					? 'Error generating text, see console for details'
					: `Error generating text: ${error.message}`,
			);
		}
	}
}
