import { InternalPromptNames, PrePromptActions } from '@/config';
import type { InputPromptProps } from '@/types';

const prompt = `
- Bold the main ideas, key terms, important phrases, or crucial numbers by making them bold.
- Be selective and avoid excessive bolding, as it can make the text appear cluttered and difficult to read.
- Do not bold entire paragraphs, as it defeats the purpose of emphasizing specific information.
- Avoid bolding any words within headings or code blocks, as it may interfere with formatting and readability.
- If the main ideas are already clear or the content is very short, do not add any bold formatting.
- When bolding words or phrases, use double asterisks (**) on either side of the text, like this: **bolded text**.
- Ensure that the bolded text does not disrupt the flow or grammatical structure of the sentences.
`;

const promptData: InputPromptProps = {
	name: InternalPromptNames.Bold,
	icon: 'highlighter',
	action: PrePromptActions.DirectReplacement,
	data: prompt,
};

export default promptData;
