import { Notice, Platform } from 'obsidian';

import {
	APIProvider,
	CustomBehavior,
	InternalPromptNames,
	PrePromptActions,
} from '@/config';
import type WordWisePlugin from '@/main';
import optionsMenu from '@/menus/optionsMenu';
import AskForInstructionModal from '@/modals/ask-for-instruction';
import GenerationConfirmationModal from '@/modals/generation-confirm';
import { getFolderBasedPrompt } from '@/prompt';
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

	if (regex.test(result)) {
		return result.replace(regex, '');
	}

	const additionalRegex = /<think>[^<]+<\/think>\n\n/;

	return result.replace(additionalRegex, '');
}

function getNonEmptyString(str?: string): string | undefined {
	if (!str) return undefined;
	return str.length > 0 ? str : undefined;
}

export async function runPrompt(
	editor: EnhancedEditor,
	plugin: WordWisePlugin,
	promptName: InternalPromptNames | string,
) {
	// Check if there is abort controller, exists, that means that there is a generation in progress
	if (plugin.generationRequestAbortController && Platform.isDesktop) {
		// Notice that there is a generation in progress
		new Notice('There is a generation in progress, please wait');
		return;
	}
	let input = editor.getSelection();

	if (input.length === 0) {
		new Notice('No input selected');
		return;
	}

	const get = editor.getCursor();

	if (promptName === InternalPromptNames.FindSynonym) {
		const from = editor.getCursor('from');
		const to = editor.getCursor('to');
		const context = editor.getLine(from.line);
		input = `${context.substring(0, from.ch)}|||${input}|||${context.substring(to.ch)}`;
	}

	// Find form global store
	const actionData = plugin.prompts.find((p) => p.name === promptName);

	// Reject if not found
	if (!actionData) {
		throw new Error(`Could not find prompt data with name ${promptName}`);
	}

	/** Specifically for `PrePromptActions.CustomInstructions` prompt */
	let customInputInstructions = '';

	if (actionData.action === PrePromptActions.CustomInstructions) {
		const modal = new AskForInstructionModal(plugin);
		modal.open();
		customInputInstructions = await modal.promise;
	}

	// Priority: Command specific > Custom Model > Provider Model
	const settingsCustomModel = getNonEmptyString(plugin.settings.customAiModel);
	const commandSpecificModel = getNonEmptyString(
		actionData.customPromptDefinedModel,
	);
	const commandSpecificProviderName = getNonEmptyString(
		actionData.customPromptDefinedProvider,
	);

	// Tried to find provider settings from name given (Current we have command specific and settings)
	const providerNameToBeFound =
		commandSpecificProviderName || plugin.settings.aiProvider;

	const providerSettingEntry = Object.entries(
		plugin.settings.aiProviderConfig,
	).find(
		([key, provider]) =>
			key === providerNameToBeFound ||
			provider.displayName === providerNameToBeFound,
	);

	if (!providerSettingEntry) {
		throw new Error(
			`Could not find provider settings with name "${providerNameToBeFound}"`,
		);
	}

	// providerSettingEntry = [key, provider <--]
	const providerSettings = providerSettingEntry[1];
	const model =
		commandSpecificModel || settingsCustomModel || providerSettings.model;

	// Reject if model is empty
	if (!getNonEmptyString(model)) {
		throw new Error('Please configure the model');
	}

	const providerDisplayName =
		// Still need to ensure if the display name is not empty
		getNonEmptyString(providerSettings?.displayName) ?? providerSettingEntry[0]; // Get the key if display name is empty
	new Notice(`${promptName} with ${providerDisplayName}`);

	let taskPrompt = actionData.taskPrompt;

	if (actionData.isFilePrompt && actionData.filePath) {
		const _data = await getFolderBasedPrompt(plugin, actionData.filePath);
		taskPrompt = _data?.data;
	}

	if (!taskPrompt) {
		throw new Error(`No task prompt found for prompt ${promptName}`);
	}

	const systemPrompt: string = Mustache.render(
		`${actionData.systemPrompt}\n\n${taskPrompt}`,
		{
			instructions: customInputInstructions,
		},
	);

	const startTime = Date.now(); // Capture start time

	const provider =
		actionData.customPromptDefinedProvider ?? plugin.settings.aiProvider;

	const providerEntry = Object.entries(plugin.settings.aiProviderConfig).find(
		([key, d]) => {
			return d.displayName === provider || key === provider;
		},
	);

	if (!providerEntry) {
		throw new Error(`Could not find provider: ${provider}`);
	}

	const modelToCall = actionData.customPromptDefinedModel ?? model;

	if (!modelToCall || modelToCall.length === 0) {
		throw new Error(
			'Please fetch the models first and select a model first or set custom model',
		);
	}

	const onAccept = async (text: string) => {
		switch (plugin.settings.customBehavior) {
			case CustomBehavior.InsertFirst:
				// Insert the generated text at the beginning of the editor
				editor.replaceRange(text, { line: get.line, ch: 0 });
				break;
			case CustomBehavior.InsertLast:
				editor.replaceRange(text, { line: get.line + 1, ch: 0 });
				break;
			default:
				editor.replaceSelection(text);
		}
	};

	const enableStreaming =
		plugin.settings.enableStreaming &&
		promptName !== 'Find Synonym' &&
		providerEntry[0] !== APIProvider.AzureOpenAI;

	const confirmModalWillShow =
		enableStreaming || plugin.settings.enableConfirmationModal;

	const confirmationModal = new GenerationConfirmationModal(
		plugin,
		promptName,
		(text) => onAccept(removeThinkingContent(text)),
		enableStreaming,
	);

	if (enableStreaming) {
		// Show the confirmation modal with streaming
		confirmationModal.open();
	}

	try {
		let result = await callTextAPI({
			plugin,
			messages: {
				system: systemPrompt,
				user: input,
			},
			baseURL: providerSettings.baseUrl,
			apiKey: providerSettings.apiKey,
			model: modelToCall,
			provider: providerEntry[0],
			providerSettings: providerSettings,
			stream: enableStreaming,
			onStreamText: (text: string) => {
				// Append the text to the modal
				confirmationModal.appendResult(text);
			},
			onStreamComplete() {
				confirmationModal.setStreamingCompleted();
			},
		});

		if (!result) {
			new Notice(`No result from ${plugin.settings.aiProvider}`);
			return;
		}

		// Directly run post-generation action, as it has "confirmation" logic inside
		if (promptName === 'Find Synonym') {
			result = removeThinkingContent(result); // Experimental

			!document.querySelector('.menu.optionContainer')
				? optionsMenu(editor, markdownListToArray(result))
				: true;
			return;
		}

		if (plugin.settings.excludeThinkingOutput) {
			result = removeThinkingContent(result);
		}

		// Log the generation to local storage
		if (plugin.settings.enableGenerationLogging) {
			const loggingBody: TextGenerationLog = {
				id: nanoid(),
				by: promptName,
				model,
				generatedAt: new Date().toISOString(),
				provider: plugin.settings.aiProvider,

				orginalText: input,
				generatedText: result,

				customInstruction: customInputInstructions,
			};

			await new ForageStorage().addTextGenerationLog(loggingBody);
		}

		const endTime = Date.now(); // Capture end time
		const timeUsed = ((endTime - startTime) / 1000).toFixed(2); // Calculate time used in seconds

		new Notice(`Text generated in ${timeUsed}s`);

		if (enableStreaming) {
			return; // Don't show the confirmation modal if streaming is enabled
		}

		if (plugin.settings.enableConfirmationModal) {
			confirmationModal.open();
			confirmationModal.setResult(result);
		} else onAccept(result);
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

		if (confirmModalWillShow) {
			confirmationModal.open();
			confirmationModal.onError(message);
			return;
		}

		// Show the error message
		new Notice(message);
	}
}
