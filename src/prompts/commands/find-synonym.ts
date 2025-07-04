import { InternalPromptNames, PrePromptActions } from '@/config';
import type { InputPromptProps } from '@/types';

const prompt = `
- Find four synonyms for the words wrapped in three pipe characters.
- Your synonyms may be single words or short phrases. Ensure that they fit naturally into the sentence and maintain the original text's tone and style.
- Use the same capitalization as the input text.
- If possible, avoid synonyms that are too obscure or complex. Prefer words that are easy to understand.
- Output the synonyms in a markdown list format, with each suggestion as a bullet point.
`;

const promptData: InputPromptProps = {
	name: InternalPromptNames.FindSynonym,
	icon: 'languages',
	action: PrePromptActions.DirectReplacement,
	data: prompt,
};

export default promptData;
