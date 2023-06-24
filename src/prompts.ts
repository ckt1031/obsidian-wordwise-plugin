export enum Commands {
	ImproveWriting = 'Improve Writing',
}

/// {{input}} as the text content to be rewritten
export const PROMPTS = [
	{
		name: Commands.ImproveWriting,
		description: `I will give you text content, you will rewrite it and output a better version of my text.
    Keep the meaning the same. Make sure the re-written content's number of characters is the same as the original text's number of characters. Do not alter the original structure and formatting outlined in any way. Only give me the output and nothing else.
    Please preserve the text symbols such as bold, markdown, ![[]], <HTML>, etc.
    Now, using the concepts above, re-write the following text. Respond in in the same text language:
    """
    {{input}}
    """`,
	},
];
