import type CodeMirror from 'codemirror';
import type { Editor, Menu } from 'obsidian';
import type * as v from 'valibot';
import type { APIProvider, CommandActions } from './config';
import type WordWisePlugin from './main';
import type {
	CommandSchema,
	ObfuscatedPluginSettingsSchema,
	PluginSettingsSchema,
	TextGenerationLogSchema,
} from './schemas';
import type { OpenAIModelsSchema } from './schemas/models';

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
	messages: {
		system: string;
		user: string;
	};
	model: string;
	baseURL: string;
	apiKey: string;
	provider: string;

	plugin: WordWisePlugin;
	providerSettings: PluginSettings['aiProviderConfig'][APIProvider];

	isTesting?: boolean;

	// Stream Mode
	stream: boolean;
	onStreamText?: (text: string) => void;
	onStreamComplete?: () => void;
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
	customDefinedProvider?: string;
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
