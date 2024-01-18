type TemplateData = Record<string, string | number | boolean>;

export function mustacheRender(template: string, data: TemplateData): string {
	return template.replace(/\{\{(.*?)\}\}/g, (match: string, key: string) => {
		const value = data[key.trim()];
		return value === undefined ? '' : String(value);
	});
}
