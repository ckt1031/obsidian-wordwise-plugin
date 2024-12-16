import { CommandActions, CommandNames } from '@/config';
import CustomInstructions from '@/icons/custom-instructions.svg';
import type { Command } from '@/types';

const prompt = `
- Follow the instructions below to make changes to the text.
- You must obey the custom instructions, and you should ignore conflicting instructions from the base instructions.
- You should not make any changes to the text that are not specified in the instructions.
- Follow the instructions below strictly:

{{instructions}}
`;

const command: Command = {
	name: CommandNames.CustomInstructions,
	icon: CustomInstructions,
	action: CommandActions.CustomInstructions,
	data: prompt,
};

export default command;
