import { z } from 'zod';

export const PluginSettingsSchema = z.object({
	openAiApiKey: z.string(),
	openAiBaseUrl: z.string(),
	openAiModel: z.string(),
	maxTokens: z.number(),
	temperature: z.number(),
	presencePenalty: z.number(),
	frequencyPenalty: z.number(),
	debugMode: z.boolean(),
});

export type PluginSettings = z.infer<typeof PluginSettingsSchema>;

export const ObfuscatedPluginSettingsSchema = z.object({
	_NOTICE: z.string(),
	z: z.string(),
});

export type ObfuscatedPluginSettings = z.infer<typeof ObfuscatedPluginSettingsSchema>;
