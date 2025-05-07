/// <reference types="vitest" />
import path from 'node:path';

import { defineConfig } from 'vite';

export default defineConfig({
	test: {
		includeSource: ['src/**/*.ts'],
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
});
