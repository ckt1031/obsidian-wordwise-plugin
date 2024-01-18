import { describe, expect, it } from 'vitest';

import { mustacheRender } from '../src/utils/mustache';

type TemplateData = Record<string, string | number | boolean>;

describe('Utils', () => {
	describe('mustacheRender', () => {
		it('should render a template with the provided data', () => {
			const template = 'Hello, {{name}}! Your age is {{age}}.';
			const data: TemplateData = {
				name: 'John',
				age: 30,
			};

			const renderedTemplate = mustacheRender(template, data);

			expect(renderedTemplate).toBe('Hello, John! Your age is 30.');
		});

		it('should render an empty string for undefined keys', () => {
			const template = 'Hello, {{name}}! Your age is {{age}}. {{unknown}}';
			const data: TemplateData = {
				name: 'John',
				age: 30,
			};

			const renderedTemplate = mustacheRender(template, data);

			expect(renderedTemplate).toBe('Hello, John! Your age is 30. ');
		});

		it('should not render the original template if there is no data', () => {
			const template = 'Hello, {{name}}! Your age is {{age}}.';
			const data: TemplateData = {};

			const renderedTemplate = mustacheRender(template, data);

			expect(renderedTemplate).toBe('Hello, ! Your age is .');
			expect(renderedTemplate).not.toBe(
				'Hello, {{name}}! Your age is {{age}}.',
			);
		});
	});
});
