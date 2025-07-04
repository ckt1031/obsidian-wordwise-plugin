import { InternalPromptNames, PrePromptActions } from '@/config';
import type { InputPromptProps } from '@/types';

const prompt = `
- Write a shorter version, keep the text clear, easy to understand, and well put together.
- Choose simple words and phrases to write the text. Avoid ones that are too hard or confusing. Write the text like a real person would. Keep your tone balanced, not too casual or too formal, to match what the text is meant to do.
`;

const promptData: InputPromptProps = {
	name: InternalPromptNames.MakeShorter,
	icon: 'brush',
	action: PrePromptActions.DirectReplacement,
	data: prompt,
};

export default promptData;
