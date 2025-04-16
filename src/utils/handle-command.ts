import { Notice, Platform } from 'obsidian';

import { getCommands } from '@/commands';
import { getFolderBasedPrompt } from '@/commands';
import { CommandActions, type CommandNames, CustomBehavior } from '@/config';
import type WordWisePlugin from '@/main';
import optionsMenu from '@/menus/optionsMenu';
import AskForInstructionModal from '@/modals/ask-for-instruction';
import GenerationConfirmationModal from '@/modals/generation-confirm';
import type { TextGenerationLog } from '@/types';
import type { EnhancedEditor } from '@/types';
import Mustache from 'mustache';
import { nanoid } from 'nanoid';
import { callTextAPI } from './call-api';
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
	// Check if there is abort controller, exists, that means that there is a generation in progress
	if (plugin.generationRequestAbortController && Platform.isDesktop) {
		// Notice that there is a generation in progress
		new Notice('There is a generation in progress, please wait');
		return;
	}

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

		const commands = await getCommands(plugin);
		const actionData = commands.find((p) => p.name === command);

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

		const providerDisplayName =
			providerSettings?.displayName ?? plugin.settings.aiProvider;

		new Notice(`${command} with ${providerDisplayName}`);

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
			plugin,
			messages: {
				system: systemPrompt,
				user: input,
			},
			baseURL: providerSettings.baseUrl,
			apiKey: providerSettings.apiKey,
			model: actionData.customDefinedModel ?? model,
			provider: providerEntry[0],
			providerSettings: providerSettings,
		});

		if (!result) {
			new Notice(`No result from ${plugin.settings.aiProvider}`);
			return;
		}

		if (plugin.settings.excludeThinkingOutput) {
			result = removeThinkingContent(result);
		}

		// Log the generation to local storage
		if (plugin.settings.enableGenerationLogging) {
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

			await new ForageStorage().addTextGenerationLog(loggingBody);
		}

		const endTime = Date.now(); // Capture end time
		const timeUsed = ((endTime - startTime) / 1000).toFixed(2); // Calculate time used in seconds

		new Notice(`Text generated in ${timeUsed}s`);

		// Directly run post-generation action, as it has "confirmation" logic inside
		if (command === 'Find Synonym') {
			!document.querySelector('.menu.optionContainer')
				? optionsMenu(editor, markdownListToArray(result))
				: true;
			return;
		}

		const onAccept = async () => {
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
		};

		if (plugin.settings.showConfirmationModal)
			new GenerationConfirmationModal(plugin, result, onAccept).open();
		else onAccept();
	} catch (error) {
		let message = 'Failed to generate text';

		if (error instanceof Error) {
			if (error.name === 'AbortError') {
				new Notice('Text generation aborted');
				return;
			}

			message += `: ${error.message}`;
		}

		// Log the error to the console
		console.error(error);

		// Show the error message
		new Notice(message);
	}
}
