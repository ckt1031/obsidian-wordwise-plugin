import type { Editor, Menu } from 'obsidian';

import type CodeMirror from 'codemirror';
import type * as v from 'valibot';

import type { APIProvider, PrePromptActions } from './config';
import type WordWisePlugin from './main';
import type {
	InputPromptSchema,
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

export type InputPromptProps = v.InferInput<typeof InputPromptSchema>;

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

export interface OutputInternalPromptProps {
	name: string;
	icon: string | undefined;
	action: PrePromptActions;
	taskPrompt: string | undefined;
	systemPrompt?: string;
	isFilePrompt?: boolean;
	filePath?: string;
	customBehavior?: string;
	customPromptDefinedModel?: string;
	customPromptDefinedProvider?: string;
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
