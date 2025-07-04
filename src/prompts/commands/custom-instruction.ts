import { InternalPromptNames, PrePromptActions } from '@/config';
import type { InputPromptProps } from '@/types';

const prompt = `
- Follow the instructions below to make changes to the text.
- You must obey the custom instructions, and you should ignore conflicting instructions from the base instructions.
- You should not make any changes to the text that are not specified in the instructions.
- Follow the instructions below strictly:

{{instructions}}
`;

const promptData: InputPromptProps = {
	name: InternalPromptNames.CustomInstructions,
	icon: 'message-square',
	action: PrePromptActions.CustomInstructions,
	data: prompt,
};

export default promptData;
