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
## Task Instructions: Fix Grammar

Proofread and correct any grammatical or spelling mistakes in the given text, focusing on the following aspects:

- Fix grammatical errors, such as incorrect verb tenses, subject-verb agreement, pronoun usage, and sentence structure.
- Correct any spelling mistakes.
- Do not make any changes to the content, tone, style, or word length of the text.
- Do not make any writing improvements or change words beyond fixing the errors.
- If there are no grammar or spelling mistakes in the text, leave the content unchanged and return the original text as is.
		`,
		},
		{
			name: CommandNames.ImproveWriting,
			icon: ImproveWritingIcon,
			action: CommandActions.DirectReplacement,
			data: `
## Task Instructions: Text Improvement

Improve the writing of the given text, focusing on the following aspects:

- Enhance clarity and readability while maintaining a tone suitable for personal notes.
- Do not make any changes to the content within quote boxes. Leave the quoted content as it is, unless if there are potential improvements or errors within the quote box.
- Re-write headings, if possible, to make them more appropriate for the content.
- Reduce duplicated wordings and improve the overall flow of the text.
- Correct any factual inaccuracies, grammar, or spelling errors.
- Choose the most appropriate punctuation and simple, familiar words that best fit the topic and purpose.
- Adjust the tone and style to be well-suited for the content.
- Preserve the original meaning and paragraph structure whenever possible.
- Aim for a similar word count, only increasing it if necessary for clarity or coherence.
- Avoid using complex or awkward words that don't fit in simple writing and personal notes.
- Use specialized terminology when needed, especially for scientific or technological content, but do not overuse it.
- Ensure that the improved writing sounds natural and appropriate for personal notes. Avoid using overly advanced English words or an excessively informal tone that may seem strange in the context of personal notes. Unless the situation calls for it, try to write from a personal perspective to maintain a relatable and authentic voice.
- If a word, phrase, or part of the text is already clear and effective, leave it unchanged.
`,
		},
		{
			name: CommandNames.IntelligentBold,
			icon: HighlightMainPointIcon,
			action: CommandActions.DirectReplacement,
			data: `
## Task Instructions: Bold

Identify and bold the most essential and significant information in the given text, focusing on the following aspects:

- Highlight the main ideas, key terms, important phrases, or crucial numbers by making them bold.
- Be selective and avoid excessive bolding, as it can make the text appear cluttered and difficult to read.
- Do not bold entire paragraphs, as it defeats the purpose of emphasizing specific information.
- Avoid bolding any words within headings or code blocks, as it may interfere with formatting and readability.
- If the main ideas are already clear or the content is very short, do not add any bold formatting.
- When bolding words or phrases, use double asterisks (\`**\`) on either side of the text, like this: **bolded text**.
- Ensure that the bolded text does not disrupt the flow or grammatical structure of the sentences.
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
