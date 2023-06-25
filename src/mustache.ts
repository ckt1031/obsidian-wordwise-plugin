type TemplateData = Record<string, string | number | boolean>;

export function mustacheRender(template: string, data: TemplateData): string {
	// eslint-disable-next-line unicorn/better-regex, unicorn/prefer-string-replace-all
	return template.replace(/\{\{(.*?)\}\}/g, (match: string, key: string) => {
		const value = data[key.trim()];
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		return value === undefined ? '' : String(value);
	});
}
