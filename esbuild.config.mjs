import process from 'node:process';

import builtins from 'builtin-modules';
import esbuild from 'esbuild';

const prod = process.argv[2] === 'production';

const context = await esbuild.context({
	entryPoints: ['src/main.ts'],
	bundle: true,
	external: [
		'obsidian',
		...builtins,
	],
	format: 'cjs',
	target: 'es2022',
	logLevel: 'info',
	minify: true,
	sourcemap: prod ? false : 'inline',
	treeShaking: true,
	legalComments: 'none',
	// WSL: /mnt/d/cktsu/Documents/Obsidian/Test/.obsidian/plugins/ai-plugin/main.js
	outfile: 'main.js',
	loader: {
		'.svg': 'text',
	},
});

if (prod) {
	await context.rebuild();
	process.exit(0);
} else {
	await context.watch();
}
