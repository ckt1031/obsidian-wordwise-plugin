/**
 * Reference: https://github.com/obsidianmd/obsidian-sample-plugin/blob/master/esbuild.config.mjs
 */

import process from 'node:process';

import builtins from 'builtin-modules';
import esbuild from 'esbuild';

const prod = process.argv[2] === 'production';

const banner = `/*
  Bundle generated: ${new Date().toISOString()}
  GitHub: https://github.com/ckt1031/obsidian-wordwise-plugin
  Node.js: ${process.version}
  This build was created with esbuild v${esbuild.version}
*/
`;

const obfuscateKey = `"${process.env.SETTINGS_OBFUSCATE_KEY}"` || '"secret"';

const context = await esbuild.context({
	banner: {
		js: banner,
	},
	entryPoints: {
		main: 'src/main.ts',
		styles: 'styles.css',
	},
	bundle: true,
	external: [
		'obsidian',
		'electron',
		'@codemirror/autocomplete',
		'@codemirror/collab',
		'@codemirror/commands',
		'@codemirror/language',
		'@codemirror/lint',
		'@codemirror/search',
		'@codemirror/state',
		'@codemirror/view',
		'@lezer/common',
		'@lezer/highlight',
		'@lezer/lr',
		...builtins,
	],
	format: 'cjs',
	target: 'es2018',
	logLevel: 'info',
	sourcemap: prod ? false : 'inline',
	treeShaking: true,
	outdir: process.env.OUTPUT_DIR ?? 'dist',
	minify: prod,
	define: {
		// Remove inline Vitest code
		'import.meta.vitest': 'undefined',
		// Embed obfuscation token
		'process.env.SETTINGS_OBFUSCATE_KEY': obfuscateKey,
	},
});

if (prod) {
	await context.rebuild();
	process.exit(0);
}

await context.watch();
