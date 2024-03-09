import { type TextComponent, setIcon, setTooltip } from 'obsidian';

// Main function to wrap the password component
export const wrapPasswordComponent = (text: TextComponent) => {
	// Create a new hider element
	const hider = text.inputEl.insertAdjacentElement(
		'beforebegin',
		document.createElement('button'),
	) as HTMLElement;

	if (!hider) return;

	setTooltip(hider, 'Toggle password visibility');

	// Set the initial icon for the hider element
	setIcon(hider, 'eye-off');

	hider.addEventListener('click', () => {
		// Check if the current input type is 'text'
		const isText = text.inputEl.getAttribute('type') === 'text';
		// Set the icon and input type based on the current input type
		const icon = isText ? 'eye-off' : 'eye';
		const type = isText ? 'password' : 'text';

		// Set the new icon for the hider element
		setIcon(hider, icon);
		// Set the new input type for the text input element
		text.inputEl.setAttribute('type', type);
		// Focus the text input element
		text.inputEl.focus();
	});

	// Set the initial input type for the text element
	text.inputEl.setAttribute('type', 'password');

	return text;
};
