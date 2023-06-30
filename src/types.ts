import { z } from 'zod';

export enum CommandNames {
	ImproveWriting = 'Improve Writing',
	FixGrammar = 'Fix Grammar',
	SimplifyText = 'Simplify Text',
	MakeShorter = 'Make Shorter',
	MakeLonger = 'Make Longer',
	Paraphrase = 'Paraphrase',
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

export interface OpenAiBillingSubscription {
	object: 'billing_subscription';
	has_payment_method: boolean;
	canceled: boolean;
	canceled_at: null | Date;
	delinquent: null | boolean;
	access_until: number;
	soft_limit: number;
	hard_limit: number;
	system_hard_limit: number;
	soft_limit_usd: number;
	hard_limit_usd: number;
	system_hard_limit_usd: number;
	plan: {
		title: string;
		id: string;
	};
	primary: boolean;
	account_name: string;
	po_number: null | string;
	billing_email: null | string;
	tax_ids: null | string;
	billing_address: null | string;
	business_address: null | string;
}

export interface OpenAiUsage {
	object: 'list';
	daily_costs: {
		timestamp: number;
		line_items: {
			name: string;
			cost: number;
		}[];
	}[];
	total_usage: number;
}
