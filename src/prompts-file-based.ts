import fm from 'front-matter';
import * as v from 'valibot';
import type WordWisePlugin from './main';
import { FilePromptPropertiesSchema } from './zod-schemas';

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

	// console.log(files)

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
	if (Object.keys(content.attributes as object).length === 0) return undefined;

	const prompt = v.safeParse(FilePromptPropertiesSchema, content.attributes);

	if (!prompt.success) return undefined;

	const attributes = prompt.output;

	if (attributes.disabled) return undefined;

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
