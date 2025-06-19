/**
 * Streams text from the OpenAI Chat Completions API.
 *
 * @param body The request body for the OpenAI Chat Completion API,
 *             excluding the 'stream' property which will be set to true.
 * @returns An object containing an AsyncIterable of text parts.
 */
export async function streamText(
	body: ReadableStream<Uint8Array<ArrayBufferLike>>,
): Promise<{ textStream: AsyncIterable<string> }> {
	// Create an AsyncGenerator to yield text parts
	const textStream = (async function* (): AsyncGenerator<string> {
		const reader = body.getReader();

		if (!reader) {
			throw new Error('Response body is not readable.');
		}

		const decoder = new TextDecoder('utf-8');

		let buffer = '';

		try {
			while (true) {
				const { done, value } = await reader.read();

				if (done) break; // End of stream

				buffer += decoder.decode(value, { stream: true });

				const lines = buffer.split('\n');

				buffer = lines.pop() || ''; // Keep the last (potentially incomplete) line in the buffer

				for (const line of lines) {
					if (line.trim() === '') continue; // Skip empty lines

					// Handle OpenAI stream response
					if (line.startsWith('data: ')) {
						const jsonStr = line.substring(6); // Remove 'data: ' prefix

						if (jsonStr === '[DONE]') {
							return; // OpenAI sent [DONE], truly end the stream
						}

						try {
							const data = JSON.parse(jsonStr);

							if (data.choices && data.choices.length > 0) {
								const delta = data.choices[0].delta;
								if (delta.content) {
									yield delta.content; // Yield the content part
								}
							}
						} catch (e) {
							console.error(
								'Error parsing JSON from stream:',
								e,
								'Line:',
								jsonStr,
							);
						}
					}
				}
			}
		} finally {
			// Ensure the reader is released even if an error occurs or stream finishes
			reader.releaseLock();
		}
	})(); // Immediately invoke the async generator function

	return { textStream };
}
