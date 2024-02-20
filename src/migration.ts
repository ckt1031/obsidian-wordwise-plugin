import { Notice } from "obsidian";
import {
	array,
	boolean,
	enum_,
	number,
	object,
	safeParseAsync,
	string,
} from "valibot";
import { DEFAULT_SETTINGS } from "./config";
import { APIProvider, CustomPromptSchema } from "./types";

const OldPluginSettingsSchemaBefore20240205 = object({
	dataSchemeDate: string(),

	apiProvider: enum_(APIProvider),

	openAiApiKey: string(),
	openAiBaseUrl: string(),
	openAiModel: string(),

	anthropicApiKey: string(),
	anthropicBaseUrl: string(),
	anthropicModel: string(),

	googleAIApiKey: string(),
	googleAIBaseUrl: string(),
	googleAIModel: string(),

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

export async function migrate20240205(settings: unknown) {
	const { success, output } = await safeParseAsync(
		OldPluginSettingsSchemaBefore20240205,
		settings,
	);

	if (!success) return settings;

	new Notice("Migrating wordwise settings to new schema");

	// Migrate to new schema
	return {
		...DEFAULT_SETTINGS,
		aiProvider: output.apiProvider,
		aiProviderConfig: {
			...DEFAULT_SETTINGS.aiProviderConfig,
			[APIProvider.OpenAI]: {
				apiKey: output.openAiApiKey,
				baseUrl: output.openAiBaseUrl,
				model: output.openAiModel,
			},
			[APIProvider.GoogleGemini]: {
				apiKey: output.googleAIApiKey,
				baseUrl: output.googleAIBaseUrl,
				model: output.googleAIModel,
			},
			[APIProvider.Anthropic]: {
				apiKey: output.anthropicApiKey,
				baseUrl: output.anthropicBaseUrl,
				model: output.anthropicModel,
			},
		},
	};
}
