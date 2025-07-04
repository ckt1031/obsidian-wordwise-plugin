import { getIcon } from 'obsidian';

export function setLetterWithCog(letter: string): string {
	// Create SVG with letter
	const originalIcon = document.createElementNS(
		'http://www.w3.org/2000/svg',
		'svg',
	);
	originalIcon.setAttribute('viewBox', '0 0 24 24');
	originalIcon.setAttribute('fill', 'none');
	originalIcon.setAttribute('stroke', 'currentColor');
	originalIcon.setAttribute('stroke-width', '2');

	// Add letter to SVG
	const letterPath = document.createElementNS(
		'http://www.w3.org/2000/svg',
		'text',
	);
	letterPath.setAttribute('x', '8');
	letterPath.setAttribute('y', '15');
	letterPath.setAttribute('font-family', 'Arial, sans-serif');
	letterPath.setAttribute('text-anchor', 'middle');
	letterPath.setAttribute('dominant-baseline', 'middle');
	letterPath.setAttribute('font-size', '20');
	letterPath.setAttribute('stroke-width', '2');
	letterPath.textContent = letter;
	originalIcon.appendChild(letterPath);

	return addBrainCogIcon(originalIcon);
}

export function addBrainCogIcon(originalIcon: SVGSVGElement | null): string {
	if (!originalIcon) {
		console.error('Original icon not found.');
		return '';
	}

	// Prevent duplicate modifications by checking if the mask already exists
	if (originalIcon.querySelector('defs > mask#icon-mask')) {
		return '';
	}

	// Assume 'getIcon' retrieves the specified icon as an SVGSVGElement
	const brainCogIcon = getIcon('brain-cog');
	if (!brainCogIcon) {
		console.error("Obsidian 'brain-cog' icon not found.");
		return '';
	}

	// Remove height and width attributes
	originalIcon.removeAttribute('height');
	originalIcon.removeAttribute('width');

	// --- Step 1: Create the mask definition ---

	const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
	const mask = document.createElementNS('http://www.w3.org/2000/svg', 'mask');
	mask.id = 'icon-mask';

	const maskRect = document.createElementNS(
		'http://www.w3.org/2000/svg',
		'rect',
	);
	maskRect.setAttribute('width', '24');
	maskRect.setAttribute('height', '24');
	maskRect.setAttribute('fill', 'white'); // White area is visible

	const maskCircle = document.createElementNS(
		'http://www.w3.org/2000/svg',
		'circle',
	);
	maskCircle.setAttribute('cx', '21');
	maskCircle.setAttribute('cy', '3');
	// 111: r="7.75"
	maskCircle.setAttribute('r', '11');
	maskCircle.setAttribute('fill', 'black'); // Black area is masked out

	mask.append(maskRect, maskCircle);
	defs.appendChild(mask);

	// --- Step 2: Group and mask the original icon's content ---

	const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
	group.setAttribute('mask', 'url(#icon-mask)');

	// Move all existing children from the original icon into the new group
	// Create a static array from the live HTMLCollection to avoid iteration issues
	const originalChildren = Array.from(originalIcon.children);
	originalChildren.forEach((child) => group.appendChild(child));

	// Rename brainCogIcon from svg to g element
	const brainCogGroup = document.createElementNS(
		'http://www.w3.org/2000/svg',
		'g',
	);
	brainCogGroup.setAttribute(
		'transform',
		'translate(21, 3) scale(0.55) translate(-18, -7)',
	);
	// Remove all attributes from the brain-cog icon
	Array.from(brainCogIcon.attributes).forEach((attr) =>
		brainCogIcon.removeAttribute(attr.name),
	);
	Array.from(brainCogIcon.children).forEach((child) =>
		brainCogGroup.appendChild(child),
	);

	// The order is important: defs must come first, then the masked content,
	// and finally the overlay icon.
	originalIcon.append(defs, group, brainCogGroup);

	return originalIcon.outerHTML;
}
