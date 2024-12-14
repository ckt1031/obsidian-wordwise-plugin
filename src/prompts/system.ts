// - Respond in the same language variety or dialect of the text.
const systemPrompt = `
Return in markdown format.
Respond the re-written text only and nothing else, while remaining all other content as it is until instructed otherwise.
Keep the same original language variety or dialect as the input text.
Preserve special components like heading structure, tags (#tag), image and URL block if they exist and do not need fixes.
`;

export default systemPrompt;
