import fm from 'front-matter';
import * as v from 'valibot';

import { PrePromptActions } from './config';
import type WordWisePlugin from './main';
import { INTERNAL_PROMPTS } from './prompts/commands';
import {
	excludeOriginalText,
	systemBasePrompt,
	withOriginalText,
} from './prompts/system';
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

			const defaultSystemPrompt = prompt.excludeOriginalText
				? `${systemBasePrompt}\n${excludeOriginalText}`
				: `${systemBasePrompt}\n${withOriginalText}`;

			return {
				name: prompt.name,
				icon: prompt.icon,
				action,
				taskPrompt: prompt.data,
				systemPrompt: prompt.systemPrompt ?? defaultSystemPrompt,
				isFilePrompt: prompt.isFilePrompt,
				filePath: prompt.filePath,

				// Customized values for the prompt
				customBehavior: prompt.customBehavior,
				customPromptDefinedModel: prompt.customPromptDefinedModel,
				customPromptDefinedProvider: prompt.customPromptDefinedProvider,
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

	return await readFile(plugin, fileContent);
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
		const parsed = await readFile(plugin, fileContent);

		if (parsed) prompts.push({ ...parsed, filePath: file });
	}

	return prompts;
}

async function readFile(
	plugin: WordWisePlugin,
	fileContent: string,
): Promise<InputPromptProps | undefined> {
	const content = fm(fileContent);

	// Ignore if content.attributes is {}
	if (Object.keys(content.attributes as object).length === 0) return;

	const prompt = v.safeParse(FilePromptPropertiesSchema, content.attributes);

	if (!prompt.success) return;

	const attributes = prompt.output;

	if (attributes.disabled) return;

	let systemPrompt = attributes.systemPrompt;

	// We might check if the attributes.systemPrompt is a relative path to the markdown file
	// We ONLY support relative path from Obsidian vault to the markdown file.
	// Starting with `~` as root directory of vault.
	if (systemPrompt?.startsWith('~/')) {
		const vault = plugin.app.vault;
		const absolutePath = systemPrompt.replace('~/', '');
		const exists = await vault.adapter.exists(absolutePath);

		if (exists) {
			const fileContent = await vault.adapter.read(absolutePath);
			systemPrompt = fileContent;
		}
	}

	return {
		name: attributes.name,
		icon: attributes.icon,
		data: content.body,

		// File prompt properties
		isFilePrompt: true,

		systemPrompt,

		// Customized values for the prompt
		customBehavior: attributes.behavior,
		customPromptDefinedModel: attributes.model,
		customPromptDefinedProvider: attributes.provider,
		excludeOriginalText: attributes.omitOriginal,
		// filePath <-- Is set in getAllFolderBasedPrompt
	};
}
