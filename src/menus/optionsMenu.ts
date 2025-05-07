// Copyright (c) 2024 Lucas Adelino, under the Mozilla Public License Version 2.0
// Very slightly adapted from code by Chetachi Ezikeuzor
// Original source available at https://github.com/chetachiezikeuzor/Highlightr-Plugin/blob/master/src/ui/highlighterMenu.ts

import { Menu, Notice } from 'obsidian';

import type { Coords, EnhancedEditor, EnhancedMenu } from '@/types';

const optionsMenu = (editor: EnhancedEditor, options: string[]): void => {
	if (editor?.hasFocus()) {
		const cursor = editor.getCursor('from');
		let coords: Coords;

		const menu = new Menu() as unknown as EnhancedMenu;

		const menuDom = menu.dom;
		menuDom.addClass('optionContainer');

		for (const option of options) {
			menu.addItem((optionItem) => {
				optionItem.setTitle(option);
				optionItem.onClick(() => {
					editor.replaceSelection(option);
				});
			});
		}

		if (editor.cursorCoords) {
			coords = editor.cursorCoords(true, 'window');
		} else if (editor.coordsAtPos) {
			const offset = editor.posToOffset(cursor);
			coords = editor.cm.coordsAtPos?.(offset) ?? editor.coordsAtPos(offset);
		} else {
			return;
		}

		menu.showAtPosition({
			x: coords.right + 25,
			y: coords.top + 20,
		});
	} else {
		new Notice('Focus must be in editor');
	}
};

export default optionsMenu;
