/**
 * Converts a string into a slug format.
 * @param input The string to be slugified.
 * @returns The slugified string.
 */
export function slugify(input: string): string {
	if (!input) return '';

	// Convert to lowercase and trim whitespace
	let slug = input.toLowerCase().trim();

	// Remove accents from characters
	slug = slug.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

	// Replace invalid characters with spaces, then trim
	slug = slug.replace(/[^a-z0-9\s-]/g, ' ').trim();

	// Replace spaces and consecutive hyphens with a single hyphen
	slug = slug.replace(/[\s-]+/g, '-');

	// Trim hyphens from start and end
	slug = slug.replace(/^-+|-+$/g, '');

	return slug;
}

if (import.meta.vitest) {
	const { describe, it, expect } = import.meta.vitest;

	describe('slugify', () => {
		it('should convert a string into a slug format', () => {
			expect(slugify('Hello-World!')).toBe('hello-world');
			expect(slugify('Hello, World!-')).toBe('hello-world');
			expect(slugify('Hello, World!')).toBe('hello-world');
			expect(slugify('  Hello, World!  ')).toBe('hello-world');
			expect(slugify('Hello, World!  ')).toBe('hello-world');
			expect(slugify('2  Hello, World!')).toBe('2-hello-world');
		});
	});
}
