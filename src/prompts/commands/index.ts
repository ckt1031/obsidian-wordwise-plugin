import bold from './bold';
import customInstruction from './custom-instruction';
import findSynonym from './find-synonym';
import fixGrammar from './fix-grammar';
import improveWriting from './improve-writing';
import makeLonger from './make-longer';
import makeShorter from './make-shorter';
import paraphrase from './paraphrase';
import simplify from './simplify';

export const INTERNAL_PROMPTS = [
	bold,
	customInstruction,
	findSynonym,
	fixGrammar,
	improveWriting,
	makeLonger,
	makeShorter,
	paraphrase,
	simplify,
].map((prompt) => {
	return {
		...prompt,
		// Mark as internal prompt for the view loaded prompts modal
		internal: true,
	};
});
