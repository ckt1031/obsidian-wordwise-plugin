import { CommandActions, CommandNames } from '@/config';
import type { Command } from '@/types';
import FixGrammarIcon from './icons/fix-grammar.svg';

const prompt = `
Proofread and correct any grammatical or spelling mistakes in the given text, focusing on the following aspects:

- Fix grammatical errors, such as incorrect verb tenses, subject-verb agreement, pronoun usage, and sentence structure.
- Correct any spelling mistakes.
- Do not make any changes to the content, tone, style, or word length of the text.
- Do not make any writing improvements or change words beyond fixing the errors.
- If there are no grammar or spelling mistakes in the text, leave the content unchanged and return the original text as is.
`;

const command: Command = {
	name: CommandNames.FixGrammar,
	icon: FixGrammarIcon,
	action: CommandActions.DirectReplacement,
	data: prompt,
};

export default command;
