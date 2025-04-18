import fm from 'front-matter';
import { safeParse } from 'valibot';
import * as v from 'valibot';
import { CommandActions } from './config';
import type WordWisePlugin from './main';
import { NATIVE_COMMANDS } from './prompts/commands';
import systemPrompt from './prompts/system';
import { CommandSchema } from './schemas';
import { FilePromptPropertiesSchema } from './schemas';
import type { CommandProps } from './types';

export async function getCommands(
	plugin: WordWisePlugin,
): Promise<CommandProps[]> {
	const settings = plugin.settings;

	// Saved in config.json
	const configCustomPrompts = settings.customPrompts;

	const internalPrompts = settings.disableNativeCommands ? [] : NATIVE_COMMANDS;

	const folderPrompts = await getAllFolderBasedPrompt(plugin);

	// Add basePromptEnding to all prompts ending
	return [...internalPrompts, ...configCustomPrompts, ...folderPrompts].map(
		(prompt) => {
			let action = CommandActions.DirectReplacement;

			// Check if prompt has Prompt type
			if ('action' in prompt && safeParse(CommandSchema, prompt)) {
				action = prompt.action as CommandActions;
			}

			return {
				name: prompt.name,
				icon: prompt.icon,
				action,
				taskPrompt: prompt.data,

				// Custom defined properties
				systemPrompt:
					'systemPrompt' in prompt
						? (prompt.systemPrompt as string)
						: systemPrompt,
				isFilePrompt: 'isFilePrompt' in prompt ? prompt.isFilePrompt : false,
				filePath: 'filePath' in prompt ? prompt.filePath : undefined,
				customDefinedModel: 'model' in prompt ? prompt.model : undefined,
				customDefinedProvider:
					'provider' in prompt ? prompt.provider : undefined,
			};
		},
	);
}

export async function getFolderBasedPrompt(
	plugin: WordWisePlugin,
	path: string,
) {
	const exists = await plugin.app.vault.adapter.exists(path);

	if (!exists) return undefined;

	const fileContent = await plugin.app.vault.adapter.read(path);
	return readFile(fileContent, true);
}

export async function getAllFolderBasedPrompt(plugin: WordWisePlugin) {
	const settings = plugin.settings;

	if (!settings.customPromptsFromFolder.enabled) return [];

	const path = settings.customPromptsFromFolder.path;

	// Check if path exists
	const exists = await plugin.app.vault.adapter.exists(path);

	if (!exists) return [];

	// Get all files in the folder
	const files = await plugin.app.vault.adapter.list(path);

	const prompts = [];

	// Read all files
	for (const file of files.files) {
		const fileContent = await plugin.app.vault.adapter.read(file);
		const parsed = readFile(fileContent);

		if (parsed) prompts.push({ ...parsed, filePath: file });
	}

	return prompts;
}

function readFile(fileContent: string, needBody = false) {
	const content = fm(fileContent);

	// Ignore if content.attributes is {}
	if (Object.keys(content.attributes as object).length === 0) return;

	const prompt = v.safeParse(FilePromptPropertiesSchema, content.attributes);

	if (!prompt.success) return;

	const attributes = prompt.output;

	if (attributes.disabled) return;

	return {
		name: attributes.name,
		// systemPrompt: attributes.systemPrompt || '',
		data: needBody ? content.body : undefined,
		icon: undefined,
		...(attributes.systemPrompt &&
			attributes.systemPrompt.length > 0 && {
				systemPrompt: attributes.systemPrompt,
			}),
		isFilePrompt: true,
		model: attributes.model,
		provider: attributes.provider,
	};
}
