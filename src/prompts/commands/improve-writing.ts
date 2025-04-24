import { InternalPromptNames, PrePromptActions } from '@/config';
import ImproveWritingIcon from '@/icons/improve-writing.svg';
import type { InputPromptProps } from '@/types';

const prompt = `
- Improve text.
- Adjust the tone and style to be well-suited for the content.
- Correct any factual inaccuracies, grammar, or spelling errors.
- Reduce duplicated wordings and improve the overall flow of the text.
- Enhance clarity and readability while maintaining a tone suitable for personal notes.
- Re-write headings, if it exists, to make them more appropriate for the content.
- Choose the most appropriate punctuation and simple, familiar words that best fit the topic and purpose.
- Preserve the original meaning and paragraph structure whenever possible.
- Aim for a similar word count, only increasing it if necessary for clarity or coherence.
- Avoid using complex or awkward words that don't fit in simple writing and personal notes.
- Use specialized terminology when needed, especially for scientific or technological content, but do not overuse it.
- Ensure that the improved writing sounds natural and appropriate for personal notes. Avoid using overly advanced English words or an excessively informal tone that may seem strange in the context of personal notes. Unless the situation calls for it, try to write from a personal perspective to maintain a relatable and authentic voice.
- If a word, phrase, or part of the text is already clear and effective, leave it unchanged.
- For Obsidian specific components like tags (#tag), linked references, or block references, do not change them unless they need fixes.
`;

const promptData: InputPromptProps = {
	name: InternalPromptNames.ImproveWriting,
	icon: ImproveWritingIcon,
	action: PrePromptActions.DirectReplacement,
	data: prompt,
};

export default promptData;
