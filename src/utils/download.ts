import type WordWisePlugin from '@/main';

export async function downloadFileWithFilePicker(blob: Blob, filename: string) {
	const url = URL.createObjectURL(blob);

	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	window.document.body.appendChild(a);
	a.click();
	window.document.body.removeChild(a);
	URL.revokeObjectURL(url);
}

export async function saveFileToObsidianConfigFolder(
	plugin: WordWisePlugin,
	blob: Blob,
	filename: string,
) {
	const vaultConfigFolderPath = plugin.app.vault.configDir;

	// Create new folder if it doesn't exist
	const configFolderName = `${plugin.manifest.id}-store`;
	const storeFolderPath = `${vaultConfigFolderPath}/${configFolderName}`;

	// Create new folder if it doesn't exist
	const storeFolderExists =
		await plugin.app.vault.adapter.exists(storeFolderPath);

	if (!storeFolderExists) {
		await plugin.app.vault.createFolder(storeFolderPath);
	}

	await plugin.app.vault.createBinary(
		`${storeFolderPath}/${filename}`,
		await blob.arrayBuffer(),
	);

	return `${storeFolderPath}/${filename}`;
}
