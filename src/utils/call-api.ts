import { APIProvider } from '@/config';
import { handleTextAnthropic } from '@/provider/anthropic';
import { handleTextCohere } from '@/provider/cohere';
import { handleTextGoogle } from '@/provider/google-ai';
import { handleTextMistral } from '@/provider/mistral';
import { handleTextOpenAI } from '@/provider/openai';
import type { CallTextAPIProps } from '@/types';

export async function callTextAPI(
	props: CallTextAPIProps,
): Promise<string | null | undefined> {
	if (props.provider === APIProvider.GoogleGemini) {
		return handleTextGoogle(props);
	}

	if (props.provider === APIProvider.Anthropic) {
		return handleTextAnthropic(props);
	}

	if (props.provider === APIProvider.Mistral) {
		return handleTextMistral(props);
	}

	if (props.provider === APIProvider.Cohere) {
		return handleTextCohere(props);
	}

	return handleTextOpenAI(props);
}
