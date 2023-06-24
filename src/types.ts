export interface PluginSettings {
	openAiApiKey: string;
	openAiBaseUrl: string;
	openAiModel: string;
	maxTokens: number;
	temperature: number;
	presencePenalty: number;
	frequencyPenalty: number;
	debugMode: boolean;
}
