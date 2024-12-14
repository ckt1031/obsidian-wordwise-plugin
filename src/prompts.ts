import { safeParse } from 'valibot';
import { CommandActions } from './config';
import type WordWisePlugin from './main';
import { getAllFolderBasedPrompt } from './prompts-file-based';
import { NATIVE_COMMANDS } from './prompts/commands';
import systemPrompt from './prompts/system';
import type { CommandProps } from './types';
import { CommandSchema } from './zod-schemas';

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
