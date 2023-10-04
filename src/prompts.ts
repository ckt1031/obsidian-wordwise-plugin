import FixGrammarIcon from './icons/fix-grammar';
import HighlightMainPointIcon from './icons/highlight-mainpoint';
import ImproveWritingIcon from './icons/improve-writing';
import MakeLongerIcon from './icons/make-longer';
import MakeShorterIcon from './icons/make-shorter';
import ParaphraseIcon from './icons/paraphrase';
import SimplifyTextIcon from './icons/simplify-text';
import type { Prompt } from './types';
import { CommandActions, CommandNames, type PluginSettings } from './types';

export function getPrompts(settings: PluginSettings) {
	const localPrompts = settings.customPrompts;

	// Add basePromptEnding to all prompts ending
	return [...PROMPTS, ...localPrompts].map(prompt => {
		return {
			...prompt,
			data: `${prompt.data}\n\n${basePromptEnding}`,
		};
	});
}

export const basePromptEnding = `Please preserve the text symbols such as bold, markdown, Obsidian specialized markdown, <HTML>, etc.
Keep the meaning the same. Only give me the output and nothing else.
Now, using the concepts above, re-write the following text. Respond in the same language variety or dialect of the following text:

{{input}}
`;

/// {{input}} as the text content to be rewritten
export const PROMPTS: Prompt = [
	{
		name: CommandNames.ImproveWriting,
		icon: ImproveWritingIcon,
		action: CommandActions.DirectReplacement,
		data: `I will give you text content, you will rewrite it and output a better version of my text.
    Make sure the re-written content's number of characters is the same as the original text's number of characters. Do not alter the original structure and formatting outlined in any way. Only give me the output and nothing else.`,
	},
	{
		name: CommandNames.FixGrammar,
		icon: FixGrammarIcon,
		action: CommandActions.DirectReplacement,
		data: `I will give you text content, you will correct the spelling, syntax and grammar of this text. Correct any spelling, syntax, or grammar mistakes in the text I give you without making any improvements or changes to the original meaning or style. In other words, only correct spelling, syntax, or grammar mistakes, do not make improvements. If the original text has no mistake, just output the original text and nothing else.
    Make sure the re-written content's number of words is the same as the original text's number of characters. Do not alter the original structure and formatting outlined in any way. Only give me the output and nothing else.`,
	},
	{
		name: CommandNames.SimplifyText,
		icon: SimplifyTextIcon,
		action: CommandActions.DirectReplacement,
		data: `Definition of "simplify language": "Simplifying language means using clear and concise language that is easy for the intended audience to understand. This involves avoiding overly complex sentence structures, technical jargon, or obscure vocabulary, and using familiar words and straightforward expressions. The goal is to make the text more accessible to a wider audience, ensuring that the message is communicated effectively without causing confusion or misunderstanding. Simplifying language can be particularly important when writing for a general audience or when trying to convey complex information or ideas in a more approachable way. It is essential for writers to strike a balance between simplifying language and maintaining the tone and voice of the text, so that it remains engaging and informative while being easy to read and understand."
    I will give you text content, you will rewrite it to "simply language" of it and output that in an easy-to-understand version of my text. 
    Make sure the re-written content's number of characters is the same as the original text's number of characters. Do not alter the original structure and formatting outlined in any way. Only give me the output and nothing else.`,
	},
	{
		name: CommandNames.MakeShorter,
		icon: MakeShorterIcon,
		action: CommandActions.DirectReplacement,
		data: "I'll give you text. You'll rewrite it and output it shorter to be no more than half the number of characters of the original text.",
	},
	{
		name: CommandNames.MakeLonger,
		icon: MakeLongerIcon,
		action: CommandActions.DirectReplacement,
		data: "I'll give you text. You'll rewrite it and output it longer to be more than twice the number of characters of the original text.",
	},
	{
		name: CommandNames.Paraphrase,
		icon: ParaphraseIcon,
		action: CommandActions.DirectReplacement,
		data: `I will give you text content, you will rewrite it and output that in a re-worded version of my text. Reword the text to convey the same meaning using different words and sentence structures. Avoiding plagiarism, improving the flow and readability of the text, and ensuring that the re-written content is unique and original. Keep the tone the same. 
    Make sure the re-written content's number of characters is exactly the same as the original text's number of characters. Do not alter the original structure and formatting outlined in any way. Only give me the output and nothing else.`,
	},
	{
		name: CommandNames.HighlightMainPoint,
		icon: HighlightMainPointIcon,
		action: CommandActions.DirectReplacement,
		data: `I will give you text content, you will hightlighting and bolding the main concept, important ideas and significant sentence with markdown ** ** to highlight them.
		You should not highlight too much words, keep it simple.
		Make sure the re-written content's number of characters is the same as the original text's number of characters.`,
	},
];
