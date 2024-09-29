import { safeParse } from 'valibot';
import { CommandActions, CommandNames } from './config';
import CustomInstructions from './icons/custom-instructions.svg';
import FindSynonymIcon from './icons/find-synonym.svg';
import FixGrammarIcon from './icons/fix-grammar.svg';
import HighlightMainPointIcon from './icons/highlight-mainpoint.svg';
import ImproveWritingIcon from './icons/improve-writing.svg';
import MakeLongerIcon from './icons/make-longer.svg';
import MakeShorterIcon from './icons/make-shorter.svg';
import ParaphraseIcon from './icons/paraphrase.svg';
import SimplifyIcon from './icons/simplify-text.svg';
import type WordWisePlugin from './main';
import { getAllFolderBasedPrompt } from './prompts-file-based';
import { type ComandProps, type Prompt, PromptSchema } from './types';

export async function getCommands(
	plugin: WordWisePlugin,
): Promise<ComandProps[]> {
	const settings = plugin.settings;

	// Saved in config.json
	const configCustomPrompts = settings.customPrompts;

	const internalPrompts = settings.disableNativeCommands
		? []
		: [...extraPrompts, ...nativePrompts];

	const folderPrompts = await getAllFolderBasedPrompt(plugin);

	// Add basePromptEnding to all prompts ending
	return [...internalPrompts, ...configCustomPrompts, ...folderPrompts].map(
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
				systemPrompt:
					'systemPrompt' in prompt
						? (prompt.systemPrompt as string)
						: systemPrompt,
				isFilePrompt: 'isFilePrompt' in prompt ? prompt.isFilePrompt : false,
				filePath: 'filePath' in prompt ? prompt.filePath : undefined,
				customDefinedModel: 'model' in prompt ? prompt.model : undefined,
				customDefinedProvider:
					'provider' in prompt ? prompt.provider : undefined,
			};
		},
	);
}

// - Respond in the same language variety or dialect of the text.
export const systemPrompt = `
## Base Instructions

- Write your output in Markdown format, using appropriate syntax for typesetting and formatting.
- Keep the same original language variety or dialect as the input text.
- Preserve relevant and necessary Markdown elements such as images, URLs, tags, checkboxes, \`[[backlinks]]\`, and triple backtick code blocks (with language ID, unless it's plain text). Do not remove them without explicit instructions.
- Maintain the distinction between tags (#tag) and headings (## Heading). Do not create tags if they do not exist in the input or remove them randomly.
- Preserve any existing tags in the input text. Do not remove them or convert them into headings, unless there is a specific need to do so. Tags are used for grouping and categorizing information in Obsidian, so it's important to keep them if they exist.
- Do not randomly change the heading structure, even in cases where tags are present below headings. Only make changes to the heading structure if it is necessary for clarity or organization.
- For math, use LaTeX enclosed in single $ for inline equations ($1+1=2$) and double \`$$\` for separate line equations. Always add at least one \`$\` wrapper for LaTeX to ensure proper rendering in Obsidian. Do not use LaTeX in headings.
- For chemistry, use the mhchem \`\ce\` command.
- Do not change names of locations, people, or unknown terms.
- If a \`cardlink\` code block is present, preserve it as a URL box.
- Respond with only the re-written text, without any comments, extra context, or triple code block delimiter with \`input\` language code.
- If the input contains Obsidian quote boxes in the format of \`> [!xxx]\`, where \`xxx\` is the title of the quote box, preserve them as they are. If \`[!xxx]+\` is used, it means the quote box is extended and shows content by default. If \`[!xxx]-\` is used, it means the quote box is collapsed and does not show content by default. Only a positive (\`+\`) or negative (\`-\`) sign is accepted after the title; do not add any extra symbols. If no sign is present, the quote box will have no default extend or hide behavior.

## Special Reminder

- Do not change location names that does have related languages, such as strange name that you don't know, then don't change them.
- Preserve code block content if necessary.
- Do not change URLs or make it encoded because this is markdown.
`;

export const inputPrompt = '{{input}}';

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
			name: CommandNames.FindSynonym,
			icon: FindSynonymIcon,
			action: CommandActions.DirectReplacement,
			data: `
## Tasks

- Find four synonyms for the words wrapped in three pipe characters.
- Your synonyms may be single words or short phrases. Ensure that they fit naturally into the sentence and maintain the original text's tone and style.
- Use the same capitalization as the input text.
- If possible, avoid synonyms that are too obscure or complex. Prefer words that are easy to understand.
- Output the synonyms in a markdown list format, with each suggestion as a bullet point.
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
