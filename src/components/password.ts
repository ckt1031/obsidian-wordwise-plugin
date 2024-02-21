import { TextComponent, setIcon, setTooltip } from 'obsidian';

// Function to create a new hider element
const createHiderElement = (text: TextComponent) => {
	// Insert a new span element before the text input element
	return text.inputEl.insertAdjacentElement(
		'beforebegin',
		document.createElement('button'),
	);
};

// Function to add a click event listener to the hider element
const addClickListener = (hider: HTMLElement, text: TextComponent) => {
	// Add a click event listener to the hider element
	hider.addEventListener('click', () => {
		// Toggle the visibility of the password on click
		togglePasswordVisibility(hider, text);
		// Focus the text input element
		text.inputEl.focus();
	});
};

// Function to toggle the visibility of the password
const togglePasswordVisibility = (hider: HTMLElement, text: TextComponent) => {
	// Check if the current input type is 'text'
	const isText = text.inputEl.getAttribute('type') === 'text';
	// Set the icon and input type based on the current input type
	const icon = isText ? 'eye-off' : 'eye';
	const type = isText ? 'password' : 'text';

	// Set the new icon for the hider element
	setIcon(hider, icon);
	// Set the new input type for the text input element
	text.inputEl.setAttribute('type', type);
};

// Main function to wrap the password component
export const wrapPasswordComponent = (text: TextComponent) => {
	// Create a new hider element
	const hider = createHiderElement(text);

	if (!hider) return;

	setTooltip(hider as HTMLElement, 'Toggle password visibility');

	// Set the initial icon for the hider element
	setIcon(hider as HTMLElement, 'eye-off');

	// Add a click event listener to the hider element
	addClickListener(hider as HTMLElement, text);

	// Set the initial input type for the text element
	text.inputEl.setAttribute('type', 'password');

	return text;
};
