import { type Editor, Notice } from 'obsidian';

import { CommandActions, type CommandNames, CustomBehavior } from '@/config';
import type WordWisePlugin from '@/main';
import AskForInstructionModal from '@/modals/ask-for-instruction';
import type { TextGenerationLog } from '@/types';
import { nanoid } from 'nanoid';
import { getCommands, inputPrompt } from '../prompts';
import { callTextAPI } from './call-api';
import { log } from './logging';
import { mustacheRender } from './mustache';
import { ForageStorage } from './storage';

export async function runCommand(
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

		let instructions = '';

		if (actionData.action === CommandActions.CustomInstructions) {
			const modal = new AskForInstructionModal(plugin);
			modal.open();
			instructions = await modal.promise;
		}

		const customModel = plugin.settings.customAiModel;

		const model =
			customModel.length > 0
				? customModel
				: plugin.settings.aiProviderConfig[plugin.settings.aiProvider].model;

		new Notice(
			`Generating text with ${command} (${plugin.settings.aiProvider})...`,
		);

		console.log(input);

		const userMessage: string = mustacheRender(
			`${actionData.taskPrompt}\n\n${inputPrompt}`,
			{
				input,
				instructions,
			},
		);

		const startTime = Date.now(); // Capture start time

		const result = await callTextAPI({
			plugin,
			messages: {
				system: actionData.systemPrompt,
				user: userMessage,
			},
		});

		if (!result) {
			new Notice(`No result from ${plugin.settings.aiProvider}`);
			return;
		}

		const loggingBody: TextGenerationLog = {
			id: nanoid(),
			by: command,
			model,
			generatedAt: new Date().toISOString(),
			provider: plugin.settings.aiProvider,

			orginalText: input,
			generatedText: result,

			customInstruction: instructions,
		};

		if (plugin.settings.enableGenerationLogging) {
			await new ForageStorage().addTextGenerationLog(loggingBody);
		}

		const get = editor.getCursor();

		switch (plugin.settings.customBehavior) {
			case CustomBehavior.InsertFirst:
				// Insert the generated text at the beginning of the editor
				editor.replaceRange(result, { line: get.line, ch: 0 });
				break;
			case CustomBehavior.InsertLast:
				editor.replaceRange(result, { line: get.line + 1, ch: 0 });
				break;
			default:
				editor.replaceSelection(result);
		}

		const endTime = Date.now(); // Capture end time
		const timeUsed = ((endTime - startTime) / 1000).toFixed(2); // Calculate time used in seconds

		const successMessage = `Text generated in ${timeUsed}s`;

		log(plugin, `${successMessage}:\n\n${result}`);

		new Notice(successMessage);
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
