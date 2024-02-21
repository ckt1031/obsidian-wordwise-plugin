type TemplateData = Record<string, string | number | boolean>;

export function mustacheRender(template: string, data: TemplateData): string {
	return template.replace(/\{\{(.*?)\}\}/g, (_match: string, key: string) => {
		const value = data[key.trim()];
		return value === undefined ? '' : String(value);
	});
}

if (import.meta.vitest) {
	const { it, expect } = import.meta.vitest;
	it('convertKeysToSnakeCase', () => {
		const template = 'Hello, {{name}}!';
		const data = { name: 'John' };
		expect(mustacheRender(template, data)).toEqual('Hello, John!');
	});
}
