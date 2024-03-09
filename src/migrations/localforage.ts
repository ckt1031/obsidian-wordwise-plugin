import type WordWisePlugin from '@/main';
import localforage from 'localforage';

export async function moveConfig(plugin: WordWisePlugin) {
	const oldInstance = localforage.createInstance({
		name: plugin.manifest.id,
	});

	// Check if old instance has data
	oldInstance.keys().then(async (keys) => {
		if (keys.length > 0) {
			// Move data to new instance
			const newInstance = localforage.createInstance({
				name: `${plugin.manifest.id}-${plugin.app.vault.getName()}`,
			});

			for (const key of keys) {
				await oldInstance.getItem(key).then(async (value) => {
					await newInstance.setItem(key, value);
				});
			}

			// Clear old instance
			await oldInstance.clear();
		}
	});

	await oldInstance.dropInstance();
}
