import { APIProvider } from '@/config';
import { handleTextAnthropic } from '@/provider/anthropic';
import { handleTextCohere } from '@/provider/cohere';
import { handleTextGitHub } from '@/provider/github';
import { handleTextGoogle } from '@/provider/google-ai';
import { handleTextMistral } from '@/provider/mistral';
import { handleTextOpenAI } from '@/provider/openai';
import type { CallTextAPIProps } from '@/types';

export async function callTextAPI(
	props: CallTextAPIProps,
): Promise<string | null | undefined> {
	const providerMap: Partial<
		Record<
			APIProvider,
			(props: CallTextAPIProps) => Promise<string | undefined>
		>
	> = {
		[APIProvider.GoogleGemini]: handleTextGoogle,
		[APIProvider.Anthropic]: handleTextAnthropic,
		[APIProvider.Mistral]: handleTextMistral,
		[APIProvider.Cohere]: handleTextCohere,
		[APIProvider.GitHub]: handleTextGitHub,
	};

	const handler =
		providerMap[props.provider as APIProvider] || handleTextOpenAI;

	return handler(props);
}
