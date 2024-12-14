import type CodeMirror from 'codemirror';
import type { Editor, Menu } from 'obsidian';
import type * as v from 'valibot';
import type { APIProvider, CommandActions } from './config';
import type WordWisePlugin from './main';
import type { OpenAIModelsSchema } from './schemas/models';
import type {
	CommandSchema,
	ObfuscatedPluginSettingsSchema,
	PluginSettingsSchema,
	TextGenerationLogSchema,
} from './zod-schemas';

export type OpenAIModels = v.InferInput<typeof OpenAIModelsSchema>;

// Unified types across the plugin
export type Models = {
	id: string;
	name?: string | undefined;
}[];

export type Command = v.InferInput<typeof CommandSchema>;

export type PluginSettings = v.InferInput<typeof PluginSettingsSchema>;

export type ObfuscatedPluginSettings = v.InferInput<
	typeof ObfuscatedPluginSettingsSchema
>;

export interface CallTextAPIProps {
	plugin: WordWisePlugin;
	messages: {
		system: string;
		user: string;
	};
	model?: string;
	provider?: APIProvider;
}

export interface ProviderTextAPIProps extends CallTextAPIProps {
	model: string;
}

export interface CommandProps {
	name: string;
	icon: string | undefined;
	action: CommandActions;
	taskPrompt: string | undefined;
	systemPrompt: string;
	isFilePrompt?: boolean;
	filePath?: string;
	customDefinedModel?: string;
	customDefinedProvider?: APIProvider;
}

export type TextGenerationLog = v.InferInput<typeof TextGenerationLogSchema>;

export interface Coords {
	top: number;
	left: number;
	right: number;
	bottom: number;
}

export type EnhancedMenu = Menu & { dom: HTMLElement };

export type EnhancedEditor = Editor & {
	cursorCoords: (where: boolean, mode: string) => Coords;
	coordsAtPos: (where: number) => Coords;
	cm: CodeMirror.Editor & { coordsAtPos: (where: number) => Coords };
	hasFocus: () => boolean;
	getSelection: () => string;
};
