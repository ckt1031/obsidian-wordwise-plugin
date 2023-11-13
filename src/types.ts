import { z } from 'zod';

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

export const customPromptSchema = z.object({
	name: z.string(),
	icon: z.string().optional(),
	data: z.string(),
});

export const PluginSettingsSchema = z.object({
	openAiApiKey: z.string(),
	openAiBaseUrl: z.string(),
	openAiModel: z.string(),
	advancedSettings: z.boolean(),
	customAiModel: z.string(),
	maxTokens: z.number(),
	temperature: z.number(),
	presencePenalty: z.number(),
	frequencyPenalty: z.number(),
	debugMode: z.boolean(),

	// Custom Prompt Settings
	customPrompts: z.array(customPromptSchema),
});

export type PluginSettings = z.infer<typeof PluginSettingsSchema>;

export const ObfuscatedPluginSettingsSchema = z.object({
	_NOTICE: z.string(),
	z: z.string(),
});

export type ObfuscatedPluginSettings = z.infer<typeof ObfuscatedPluginSettingsSchema>;

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
