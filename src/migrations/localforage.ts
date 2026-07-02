import localforage from 'localforage';

import type WordWisePlugin from '@/main';

async function checkIfIndexedDBExists(name: string) {
	const databases = await indexedDB.databases();

	return databases.some((database) => database.name === name);
}

async function removeIndexedDB(name: string) {
	const exists = await checkIfIndexedDBExists(name);
	if (exists) indexedDB.deleteDatabase(name);
}

export async function upgradeLocalForageInstance(plugin: WordWisePlugin) {
	// Versions before 1.2.0 stored localForage data under the vault name.
	// Newer versions use appId so duplicated vault names do not collide.
	// Keep this for users who skip directly from old releases to 1.4.0+.
	const oldKey = `${plugin.manifest.id}-${plugin.app.vault.getName()}`;
	const newKey = `${plugin.manifest.id}-${plugin.app.appId}`;
	const oldExists = await checkIfIndexedDBExists(oldKey);
	const newExists = await checkIfIndexedDBExists(newKey);

	if (!oldExists || newExists) return;

	const oldInstance = localforage.createInstance({
		name: oldKey,
	});
	const newInstance = localforage.createInstance({
		name: newKey,
	});

	const oldKeys = await oldInstance.keys();

	// Copy cached models and generation logs before dropping the legacy database.
	for (const key of oldKeys) {
		const value = await oldInstance.getItem(key);
		await newInstance.setItem(key, value);
	}

	await removeIndexedDB(oldKey);
}
