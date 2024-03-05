import { safeParse } from 'valibot';
import { CommandActions, CommandNames } from './config';
import CustomInstructions from './icons/custom-instructions.svg';
import FixGrammarIcon from './icons/fix-grammar.svg';
import HighlightMainPointIcon from './icons/highlight-mainpoint.svg';
import ImproveWritingIcon from './icons/improve-writing.svg';
import MakeLongerIcon from './icons/make-longer.svg';
import MakeShorterIcon from './icons/make-shorter.svg';
import ParaphraseIcon from './icons/paraphrase.svg';
import SimplifyIcon from './icons/simplify-text.svg';
import { ComandProps, type Prompt, PromptSchema } from './types';
import { type PluginSettings } from './types';

export function getCommands(settings: PluginSettings): ComandProps[] {
	const localCustomPrompts = settings.customPrompts;

	// Add basePromptEnding to all prompts ending
	return [...extraPrompts, ...nativePrompts, ...localCustomPrompts].map(
		(prompt) => {
			let action = CommandActions.DirectReplacement;

			// Check if prompt has Prompt type
			if ('action' in prompt && safeParse(PromptSchema, prompt)) {
				action = prompt.action as CommandActions;
			}

			return {
				name: prompt.name,
				icon: prompt.icon,
				action,
				taskPrompt: prompt.data,
				systemPrompt,
			};
		},
	);
}

export const systemPrompt = `
## Base Instructions

- Remain headings if given.
- Leverage LATEX for mathematical expressions, mhchem \`\ce\` for chemistry, use single $ for inline sentence ($1+1=2$), but double \`$$\` for line separation.
- Change text in the ##Input area, text WRAPPED by ===.
- This is plain markdown, never encode URLs/characters/symbols or change the structure of the markdown.
- Keep the meaning the same. If possible, retain the structure of the paragraphs. Ensure the re-written text's word count is near to the original text.
- Response with the rewritten text only, do not include additional context, explanation, or extra wording, just the re-written text itself.
- Respond in the same language variety or dialect of the text.
- Keep the suitable markdown compounds if present, such as images, URLs, checkbox, and Obsidian backlinks \`[[xxx]]\` and specified triple backtick boxes (also maintain its language identifier, unless its content is code).

## Special Reminder

- Do not change location names that does have related languages, such as strange name that you don't know, then don't change them.
- Preserve code block content if necessary.
- Do not change URLs or make it encoded because this is markdown.
`;

export const inputPrompt = `
## Input

===CONTENT-START===
{{input}}
===CONTENT-END===
`;

export const extraPrompts: (Omit<Prompt, 'name'> & { name: CommandNames })[] = [
	{
		name: CommandNames.CustomInstructions,
		icon: CustomInstructions,
		action: CommandActions.CustomInstructions,
		data: `
## Tasks

- Follow the instructions below to make changes to the text.
- You must obey the custom instructions, and you should ignore conflicting instructions from the base instructions.
- You should not make any changes to the text that are not specified in the instructions.

## Custom Instructions

{{instructions}}
`,
	},
];

export const nativePrompts: (Omit<Prompt, 'name'> & { name: CommandNames })[] =
	[
		{
			name: CommandNames.ImproveWriting,
			icon: ImproveWritingIcon,
			action: CommandActions.DirectReplacement,
			data: `
## Tasks

- Improve writing of the text.
- Remain the tone.
- Fix the factual inaccuracy.
- Reduce duplicated ideas and wordings, keep writing simple and concise.
- Make the text clearer, easier to understand, and well put together by correcting grammar, spelling, choosing the most suitable punctuation marks, and selecting the best tone and style based on the topic and purpose of the text.
- Choose simple words and phrases to improve the text. Avoid ones that are too hard or confusing. Write the text like a real person would. Keep your tone balanced, not too casual or too formal, to match what the text is meant to do.
- Do not use advanced or strange words that are not suitable for simple writings. You may use terminology or specialized words if it is necessary.
- Keep everything fluent and highly readable. If a word, phrase, or part of the text is already clear and effective, leave it as it is, unchanged.
`,
		},
		{
			name: CommandNames.FixGrammar,
			icon: FixGrammarIcon,
			action: CommandActions.DirectReplacement,
			data: `
## Tasks

- Proofread and correct the spelling and grammar mistakes.
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

- Write a shorter version, keep the text clear, easy to understand, and well put together.
- Choose simple words and phrases to write the text. Avoid ones that are too hard or confusing. Write the text like a real person would. Keep your tone balanced, not too casual or too formal, to match what the text is meant to do.
`,
		},
		{
			name: CommandNames.MakeLonger,
			icon: MakeLongerIcon,
			action: CommandActions.DirectReplacement,
			data: `
## Tasks

- Write a longer version, keep the text clear, easy to understand, and well put together.
- Choose simple words and phrases to write the text. Avoid ones that are too hard or confusing. Write the text like a real person would. Keep your tone balanced, not too casual or too formal, to match what the text is meant to do.
- Keep the meaning the same if possible. Ensure the rewritten text's word count is more than twice the original text but no more than 4 times the original text.
`,
		},
		{
			name: CommandNames.IntelligentBold,
			icon: HighlightMainPointIcon,
			action: CommandActions.DirectReplacement,
			data: `
## Tasks

- Bold the most **important ideas, words, stats, numbers, or sentences**.
- Keep the bolding clear and simple. Do not make it messy or confusing.
- **Avoid bolding too much text**. If everything is worth bolded, then nothing stands out.
- NEVER bolding headings or whole paragraphs, never change or bold the backstick wrapped content.
`,
		},
		{
			name: CommandNames.Paraphrase,
			icon: ParaphraseIcon,
			action: CommandActions.DirectReplacement,
			data: `
## Tasks

- Reformulate the sentences, changing the structure and using synonyms where appropriate, without distorting the meaning of the text.
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

- Simplify the following.
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
