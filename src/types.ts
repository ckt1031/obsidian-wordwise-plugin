import {
	type Output,
	array,
	boolean,
	number,
	object,
	optional,
	string,
} from 'valibot';

export enum CommandNames {
	ImproveWriting = 'Improve Writing',
	FixGrammar = 'Fix Grammar',
	SimplifyText = 'Simplify Text',
	MakeShorter = 'Make Shorter',
	MakeLonger = 'Make Longer',
	Paraphrase = 'Paraphrase',
	HighlightMainPoint = 'Highlight Main Point',
}

export enum CommandActions {
	DirectReplacement = 0,
	ModalConfirmation = 1,
}

export type Prompt = {
	name: CommandNames | string;
	icon?: string;
	action: CommandActions;
	data: string;
}[];

export const CustomPromptSchema = object({
	name: string(),
	icon: optional(string()),
	data: string(),
});

export const PluginSettingsSchema = object({
	openAiApiKey: string(),
	openAiBaseUrl: string(),
	openAiModel: string(),
	advancedSettings: boolean(),
	customAiModel: string(),
	maxTokens: number(),
	temperature: number(),
	presencePenalty: number(),
	frequencyPenalty: number(),
	debugMode: boolean(),

	// Custom Prompt Settings
	customPrompts: array(CustomPromptSchema),
});

export type PluginSettings = Output<typeof PluginSettingsSchema>;

export const ObfuscatedPluginSettingsSchema = object({
	_NOTICE: string(),
	z: string(),
});

export type ObfuscatedPluginSettings = Output<
	typeof ObfuscatedPluginSettingsSchema
>;

export interface OpenAiKeyCredit {
	consumedCredits: number;
	remainingCredits: number;
	totalCredits: number;
	expiryDate: string;
}

export interface CallAPIProps {
	settings: PluginSettings;
	userMessages: string;
	enableSystemMessages: boolean;
}
