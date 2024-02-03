import { MessageContent } from '@langchain/core/messages';

export function handleInvoke(content: MessageContent) {
	if (typeof content === 'string') {
		return content;
	}

	if (content[0].type === 'text') {
		return content[0].text;
	}

	throw new Error('Invalid response');
}
