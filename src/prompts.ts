import FixGrammarIcon from './icons/fix-grammar.svg';
import HighlightMainPointIcon from './icons/highlight-mainpoint.svg';
import ImproveWritingIcon from './icons/improve-writing.svg';
import MakeLongerIcon from './icons/make-longer.svg';
import MakeShorterIcon from './icons/make-shorter.svg';
import type { Prompt } from './types';
import { CommandActions, CommandNames, type PluginSettings } from './types';

export function getPrompts(settings: PluginSettings) {
	const localPrompts = settings.customPrompts;

	// Add basePromptEnding to all prompts ending
	return [...PROMPTS, ...localPrompts].map((prompt) => {
		return {
			...prompt,
			data: `${prompt.data}\n\n${basePromptEnding}`,
		};
	});
}

export const basePromptEnding = `
## Instructions

- Keep the meaning the same. If possible, retain the structure of the paragraphs. Ensure the re-written text's word count is near to the original text.
- Output the answer without additional context, explanation, or extra wording, just the corrected text itself. Don't use any punctuation, especially no quotes or backticks, around the text.
- Respond in the same language variety or dialect of the text.
- Keep the suitable markdown compounds if present, such as images, URLs.
- You should not return the 3 backticks **wrapper** in the text response.

Text:

\`\`\`{{input}}\`\`\`
`;

/// {{input}} as the text content to be rewritten
export const PROMPTS: Prompt = [
	{
		name: CommandNames.ImproveWriting,
		icon: ImproveWritingIcon,
		action: CommandActions.DirectReplacement,
		data: `
		## Tasks

		- You are a real human that can read and write properly and fluently.
		- Your task is to write a better version of the following text delimited by triple backticks.
		- Your task means making the text clearer, easier to understand, and well put together, by correcting grammar, spelling, choosing the most suitable punctuation marks, selecting the best tone and style based on the topic and purpose of the text.
		- Choose simple words and phrases to improve the text. Avoid ones that are too hard or confusing. Write the text like a real person would. Keep your tone balanced, not too casual or too formal, to match what the text is meant to do. If a word, phrase, or part of the text is already clear and effective, leave it as it is, unchanged.
		`,
	},
	{
		name: CommandNames.FixGrammar,
		icon: FixGrammarIcon,
		action: CommandActions.DirectReplacement,
		data: `
		## Tasks

		- You are a highly proficient writer that can read and write properly and fluently. Your task is to proofread and correct the spelling and grammar mistakes of the following text delimited by triple backticks.
		- Make as few changes as possible. Only correct any spelling or grammar mistakes if the original text has spelling or grammar mistakes. Do not make any writing improvements.
		- If the original text has no spelling or grammar mistakes, simply repeat the original text.
    `,
	},
	{
		name: CommandNames.MakeShorter,
		icon: MakeShorterIcon,
		action: CommandActions.DirectReplacement,
		data: `
		## Tasks

    - You are a real human that can read and write properly and fluently.
    - Your task is to write a shorter version of the following text delimited by triple backticks.
    - Your task means making the text shorter, and keeping the text clear, easy to understand, and well put together.
    - Choose simple words and phrases to write the text. Avoid ones that are too hard or confusing. Write the text like a real person would. Keep your tone balanced, not too casual or too formal, to match what the text is meant to do.
    `,
	},
	{
		name: CommandNames.MakeLonger,
		icon: MakeLongerIcon,
		action: CommandActions.DirectReplacement,
		data: `
		## Tasks

		- You are a real human that can read and write properly and fluently. Your task is to write a longer version of the following text delimited by triple backticks.
		- Your task means making the text longer, and keeping the text clear, easy to understand, and well put together.
		- Choose simple words and phrases to write the text. Avoid ones that are too hard or confusing. Write the text like a real person would. Keep your tone balanced, not too casual or too formal, to match what the text is meant to do.
		- Keep the meaning the same if possible. Ensure the rewritten text's word count is more than twice the original text but no more than 4 times the original text.
		- Output the answer without additional context, explanation, or extra wording, just the lengthened text itself. Don't use any punctuation, especially no quotes or backticks, around the text.
		- Respond in the same language variety or dialect of the text.
		`,
	},
	{
		name: CommandNames.HighlightMainPoint,
		icon: HighlightMainPointIcon,
		action: CommandActions.DirectReplacement,
		data: `
		## Tasks

		- You are a real human that can read and write properly and fluently.
		- Your task is to write a shorter version of the following text delimited by triple backticks.
		- Your task means making the text shorter, and keeping the text clear, easy to understand, and well put together.
		- Choose simple words and phrases to write the text. Avoid ones that are too hard or confusing. Write the text like a real person would. Keep your tone balanced, not too casual or too formal, to match what the text is meant to do.
		`,
	},
];
