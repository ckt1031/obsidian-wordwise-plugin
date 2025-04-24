import fm from 'front-matter';
import * as v from 'valibot';
import { PrePromptActions } from './config';
import type WordWisePlugin from './main';
import { INTERNAL_PROMPTS } from './prompts/commands';
import defaultPluginSystemPrompt from './prompts/system';
import { FilePromptPropertiesSchema } from './schemas';
import type { InputPromptProps, OutputInternalPromptProps } from './types';

export async function retrieveAllPrompts(
	plugin: WordWisePlugin,
): Promise<OutputInternalPromptProps[]> {
	const settings = plugin.settings;

	// Saved in config.json
	const configCustomPrompts = settings.customPrompts;

	// Internal prompts hard coded in the plugin
	const internalPrompts = settings.disableInternalPrompts
		? []
		: INTERNAL_PROMPTS;

	const folderPrompts = await getAllFolderBasedPrompt(plugin);

	// Add basePromptEnding to all prompts ending
	return [...internalPrompts, ...configCustomPrompts, ...folderPrompts].map(
		(prompt) => {
			let action = PrePromptActions.DirectReplacement;

			// Check if prompt has it's own action mode
			if ('action' in prompt) {
				action = prompt.action as PrePromptActions;
			}

			return {
				name: prompt.name,
				icon: prompt.icon,
				action,
				taskPrompt: prompt.data,
				systemPrompt: prompt.systemPrompt ?? defaultPluginSystemPrompt,
				isFilePrompt: prompt.isFilePrompt,
				filePath: prompt.filePath,
				customCommandDefinedModel: prompt.customPromptDefinedModel,
				customCommandDefinedProvider: prompt.customPromptDefinedProvider,
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
	return readFile(fileContent);
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

function readFile(fileContent: string): InputPromptProps | undefined {
	const content = fm(fileContent);

	// Ignore if content.attributes is {}
	if (Object.keys(content.attributes as object).length === 0) return;

	const prompt = v.safeParse(FilePromptPropertiesSchema, content.attributes);

	if (!prompt.success) return;

	const attributes = prompt.output;

	if (attributes.disabled) return;

	return {
		name: attributes.name,
		icon: undefined,
		data: content.body,
		isFilePrompt: true,
		customPromptDefinedModel: attributes.model,
		customPromptDefinedProvider: attributes.provider,
		// filePath <-- Is set in getAllFolderBasedPrompt
	};
}
