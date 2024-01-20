import FixGrammarIcon from './icons/fix-grammar.svg';
import HighlightMainPointIcon from './icons/highlight-mainpoint.svg';
import ImproveWritingIcon from './icons/improve-writing.svg';
import MakeLongerIcon from './icons/make-longer.svg';
import MakeShorterIcon from './icons/make-shorter.svg';
import ParaphraseIcon from './icons/paraphrase.svg';
import SimplifyIcon from './icons/simplify-text.svg';
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
- Your task is to rewrite the following text delimited by triple backticks in a different way while keeping the original meaning intact.

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
		- Your task is to improve the following text.
		- Make the text clearer, easier to understand, and well put together by correcting grammar, spelling, choosing the most suitable punctuation marks, and selecting the best tone and style based on the topic and purpose of the text.
		- Choose simple words and phrases to improve the text. Avoid ones that are too hard or confusing. Write the text like a real person would. Keep your tone balanced, not too casual or too formal, to match what the text is meant to do.
		- Do not use advanced or strange words that are not suitable for simple writings. You may use terminology or specialized words if it is necessary.
		- Keep everything fluent and highly readable. If a word, phrase, or part of the text is already clear and effective, leave it as it is, unchanged.`,
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
		- Highlighting means marking the most important words, phrases, or sentences in a text. It should be used sparingly and only for the most crucial points.
		- Your task means identifying the key ideas or arguments, and marking them in a way that makes them stand out.
		- Avoid highlighting too much text. If everything is highlighted, then nothing stands out. Aim to highlight only one sentence or phrase per paragraph.
		- Keep the highlighting clear and simple. Do not make it messy or confusing.
		- If a word, phrase, or part of the text is already clear and effective, leave it as it is, unchanged.
		`,
	},
	{
		name: CommandNames.Paraphrase,
		icon: ParaphraseIcon,
		action: CommandActions.DirectReplacement,
		data: `
		## Tasks
	
		- You are a real human that can read and write properly and fluently.
		- Aim to reformulate the sentences, changing the structure and using synonyms where appropriate, without distorting the meaning of the text.
		- Avoid using the same phrases or terminology as the original text unless necessary. The paraphrased text should be distinct yet convey the same information.
		- Ensure that the paraphrased version is clear, concise, and maintains the tone appropriate to the context of the original text.
		- Do not add new information or your own opinion, but focus on reflecting the ideas presented in the source material.
		- If the text is technical or contains specialized language, strive to simplify the content without losing the intended message.
		- If a word, phrase, or part of the text is already clear and effective, you may leave it as it is, unchanged.
		`,
	},
	{
		name: CommandNames.SimplifyText,
		icon: SimplifyIcon,
		action: CommandActions.DirectReplacement,
		data: `
		## Tasks
		
		- You are a real human that can read and write properly and fluently.
		- Your task is to simplify the following text delimited by triple backticks.
		- Make the text clearer and easier to understand by using simple words and phrases. Avoid ones that are too hard or confusing.
		- Keep sentences short and divide long statements into smaller ones. Aim for sentences that are 15 to 20 words long.
		- Write in an active voice and use strong verbs to make your writing more direct and engaging.
		- Remove unnecessary words, phrases, or clauses that do not contribute to the meaning of the text.
		- Ensure that the simplified text retains the original meaning and context.
		- Do not add new information or your own opinion, but focus on reflecting the ideas presented in the source material.
		- If a word, phrase, or part of the text is already clear and effective, leave it as it is, unchanged.
		`,
	},
];
