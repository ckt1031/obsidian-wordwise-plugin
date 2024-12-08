import type CodeMirror from 'codemirror';
import type { Editor, Menu } from 'obsidian';
import type * as v from 'valibot';
import type { APIProvider, CommandActions } from './config';
import type WordWisePlugin from './main';
import type { OpenAIModelsSchema } from './schemas/models';
import type {
	ObfuscatedPluginSettingsSchema,
	PluginSettingsSchema,
	PromptSchema,
	TextGenerationLogSchema,
} from './zod-schemas';

export type OpenAIModels = v.InferInput<typeof OpenAIModelsSchema>;
export type UniformModels = {
	id: string;
	name?: string | undefined;
}[];

export type Prompt = v.InferInput<typeof PromptSchema>;

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
