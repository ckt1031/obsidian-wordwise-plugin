import { InternalPromptNames, PrePromptActions } from '@/config';
import ParaphraseIcon from '@/icons/paraphrase.svg';
import type { InputPromptProps } from '@/types';

const prompt = `
- Reformulate the sentences, changing the structure and using synonyms where appropriate, without distorting the meaning of the text.
- Avoid using the same phrases or terminology as the original text unless necessary. The paraphrased text should be distinct yet convey the same information.
- Ensure that the paraphrased version is clear, concise, and maintains the tone appropriate to the context of the original text.
- Do not add new information or your own opinion, but focus on reflecting the ideas presented in the source material.
- If the text is technical or contains specialized language, strive to simplify the content without losing the intended message.
- If a word, phrase, or part of the text is already clear and effective, you may leave it as it is, unchanged.
`;

const promptData: InputPromptProps = {
	name: InternalPromptNames.Paraphrase,
	icon: ParaphraseIcon,
	action: PrePromptActions.DirectReplacement,
	data: prompt,
};

export default promptData;
