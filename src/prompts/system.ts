const systemBasePrompt = `
- Return in markdown format.
- Never change the existing URLs, tags or image blocks if not instructed to do so.
`;

const excludeOriginalText = `
You will be given a text and you should only respond the text following to the instructions, and never respond with the original text.
`;

const withOriginalText = `
- Keep the same original language variety or dialect as the input text.
- Preserve special components like heading structure, tags (#tag), image and URL block if they exist and do not need fixes.
- Respond the re-written text only and nothing else, while remaining all other content as it is until instructed otherwise.
`;

export { systemBasePrompt, excludeOriginalText, withOriginalText };
