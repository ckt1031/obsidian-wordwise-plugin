import { APIProvider } from '@/config';
import { handleTextAzure } from '@/provider/azure-openai';
import { handleTextOpenAI } from '@/provider/openai';
import type { CallTextAPIProps } from '@/types';

export async function callTextAPI(
	props: CallTextAPIProps,
): Promise<string | null | undefined> {
	if (props.provider === APIProvider.AzureOpenAI) {
		return handleTextAzure(props);
	}

	return handleTextOpenAI(props);
}
