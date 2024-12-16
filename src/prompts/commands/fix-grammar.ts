import { CommandActions, CommandNames } from '@/config';
import FixGrammarIcon from '@/icons/fix-grammar.svg';
import type { Command } from '@/types';

const prompt = `
- Fix linguistic issues in all part of the text.
- Fix wrong grammar, such as incorrect verb tenses, singular form, upper-lower case, subject-verb agreement, pronoun usage, and sentence structure.
- Fix spelling issues.
- If there are no grammar or spelling mistakes in the text, return the original text as is.
`;

const command: Command = {
	name: CommandNames.FixGrammar,
	icon: FixGrammarIcon,
	action: CommandActions.DirectReplacement,
	data: prompt,
};

export default command;
