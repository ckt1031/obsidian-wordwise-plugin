import { InternalPromptNames, PrePromptActions } from '@/config';
import type { InputPromptProps } from '@/types';

const prompt = `
- Make the text clearer and easier to understand by using simple words and phrases. Avoid ones that are too hard or confusing.
- Keep sentences short and divide long statements into smaller ones. Aim for sentences that are 15 to 20 words long.
- Write in an active voice and use strong verbs to make your writing more direct and engaging.
- Remove unnecessary words, phrases, or clauses that do not contribute to the meaning of the text.
- Ensure that the simplified text retains the original meaning and context.
- Do not add new information or your own opinion, but focus on reflecting the ideas presented in the source material.
- If a word, phrase, or part of the text is already clear and effective, leave it as it is, unchanged.
`;

const promptData: InputPromptProps = {
	name: InternalPromptNames.SimplifyText,
	icon: 'recycle',
	action: PrePromptActions.DirectReplacement,
	data: prompt,
};

export default promptData;
