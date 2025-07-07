import { APIProvider } from '@/config';
import { handleTextAzure } from '@/provider/azure-openai';
import { handleTextOpenAI } from '@/provider/openai';
import type { CallTextAPIProps } from '@/types';

export async function callTextAPI(
	props: CallTextAPIProps,
): Promise<string | null | undefined> {
	const { model, plugin, providerSettings } = props;
	let requestModel = model;

	if (
		providerSettings.customModelId &&
		providerSettings.customModelId.length > 0 &&
		plugin.settings.advancedSettings
	) {
		requestModel = providerSettings.customModelId;
	}

	if (props.provider === APIProvider.AzureOpenAI) {
		return handleTextAzure({ ...props, model: requestModel });
	}

	return handleTextOpenAI({ ...props, model: requestModel });
}
