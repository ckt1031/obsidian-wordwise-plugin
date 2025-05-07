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
	/**
	 * Migration Program version: 1.2.0+
	 */

	// First version that used IndexDB: plugin.manifest.id (Removed migration support for version > 1.2.0)
	// Recent version <= 1.2.0: [plugin.manifest.id]-[vault name]
	// New version: [plugin.manifest.id]-[App ID]
	const oldKey = `${plugin.manifest.id}-${plugin.app.vault.getName()}`;
	const newKey = `${plugin.manifest.id}-${plugin.app.appId}`;
	const oldExists = await checkIfIndexedDBExists(oldKey);
	const newExists = await checkIfIndexedDBExists(newKey);

	// If the old instance doesn't exist, or the new instance already exists, return
	if (!oldExists || newExists) return;

	const oldInstance = localforage.createInstance({
		name: oldKey,
	});
	const newInstance = localforage.createInstance({
		name: newKey,
	});

	// // Check if old instance has data
	const oldKeys = await oldInstance.keys();

	if (oldKeys.length > 0) {
		for (const key of oldKeys) {
			const value = await oldInstance.getItem(key);
			await newInstance.setItem(key, value);
		}
	}

	// Drop old instance
	await removeIndexedDB(oldKey);
}
