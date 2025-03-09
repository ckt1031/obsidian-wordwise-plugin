import { Notice } from 'obsidian';

import { getCommands } from '@/commands';
import { getFolderBasedPrompt } from '@/commands';
import { CommandActions, type CommandNames, CustomBehavior } from '@/config';
import type WordWisePlugin from '@/main';
import optionsMenu from '@/menus/optionsMenu';
import AskForInstructionModal from '@/modals/ask-for-instruction';
import type { TextGenerationLog } from '@/types';
import type { EnhancedEditor } from '@/types';
import Mustache from 'mustache';
import { nanoid } from 'nanoid';
import { callTextAPI } from './call-api';
import { log } from './logging';
import { ForageStorage } from './storage';

function markdownListToArray(markdownList: string): string[] {
	return markdownList
		.split('\n') // Split the input string by newlines
		.map((line) => line.trim()) // Trim whitespace from each line
		.filter((line) => line.length > 0) // Filter out empty lines
		.map((line) => line.replace(/^[-*]\s+|\d+\.\s+/, '')); // Remove Markdown list markers
}

export function removeThinkingContent(result: string): string {
	// Find out \n<think>.+</think>\n and remove it
	const regex = /\n<think>[^<]+<\/think>\n\n/;

	return result.replace(regex, '');
}

export async function runCommand(
	editor: EnhancedEditor,
	plugin: WordWisePlugin,
	command: CommandNames | string,
) {
	try {
		let input = editor.getSelection();

		if (input.length === 0) {
			new Notice('No input selected');
			return;
		}

		const get = editor.getCursor();

		if (command === 'Find Synonym') {
			const from = editor.getCursor('from');
			const to = editor.getCursor('to');
			const context = editor.getLine(from.line);
			input = `${context.substring(0, from.ch)}|||${input}|||${context.substring(to.ch)}`;
		}

		log(plugin, `Running command: ${command}`);

		const actionData = (await getCommands(plugin)).find(
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

		const providerSettings =
			plugin.settings.aiProviderConfig[plugin.settings.aiProvider];

		const model = customModel.length > 0 ? customModel : providerSettings.model;

		new Notice(`Generating text with ${command}...`);

		let taskPrompt = actionData.taskPrompt;

		if (actionData.isFilePrompt && actionData.filePath) {
			const _data = await getFolderBasedPrompt(plugin, actionData.filePath);
			taskPrompt = _data?.data;
		}

		if (!taskPrompt) {
			throw new Error(`No task prompt found for command ${command}`);
		}

		const systemPrompt: string = Mustache.render(
			`${actionData.systemPrompt}\n\n${taskPrompt}`,
			{
				instructions,
			},
		);

		const startTime = Date.now(); // Capture start time

		const provider =
			actionData.customDefinedProvider ?? plugin.settings.aiProvider;

		const providerEntry = Object.entries(plugin.settings.aiProviderConfig).find(
			([key, d]) => {
				return d.displayName === provider || key === provider;
			},
		);

		if (!providerEntry) {
			throw new Error(`Could not find provider: ${provider}`);
		}

		let result = await callTextAPI({
			messages: {
				system: systemPrompt,
				user: input,
			},
			host: providerSettings.baseUrl,
			apiKey: providerSettings.apiKey,
			allSettings: plugin.settings,
			model: actionData.customDefinedModel ?? model,
			provider: providerEntry[0],
			providerSettings: providerSettings,
		});

		if (!result) {
			new Notice(`No result from ${plugin.settings.aiProvider}`);
			return;
		}

		if (plugin.settings.doNotIncludeThinkingContentToFinalText) {
			result = removeThinkingContent(result);
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

		switch (plugin.settings.customBehavior) {
			case CustomBehavior.InsertFirst:
				// Insert the generated text at the beginning of the editor
				editor.replaceRange(result, { line: get.line, ch: 0 });
				break;
			case CustomBehavior.InsertLast:
				editor.replaceRange(result, { line: get.line + 1, ch: 0 });
				break;
			default:
				if (command === 'Find Synonym') {
					!document.querySelector('.menu.optionContainer')
						? optionsMenu(editor, markdownListToArray(result))
						: true;
				} else {
					editor.replaceSelection(result);
				}
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
