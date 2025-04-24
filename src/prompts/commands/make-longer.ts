import { InternalPromptNames, PrePromptActions } from '@/config';
import MakeLongerIcon from '@/icons/make-longer.svg';
import type { InputPromptProps } from '@/types';

const prompt = `
- Write a longer version, keep the text clear, easy to understand, and well put together.
- Choose simple words and phrases to write the text. Avoid ones that are too hard or confusing. Write the text like a real person would. Keep your tone balanced, not too casual or too formal, to match what the text is meant to do.
- Keep the meaning the same if possible. Ensure the rewritten text's word count is more than twice the original text but no more than 4 times the original text.
`;

const promptData: InputPromptProps = {
	name: InternalPromptNames.MakeLonger,
	icon: MakeLongerIcon,
	action: PrePromptActions.DirectReplacement,
	data: prompt,
};

export default promptData;
