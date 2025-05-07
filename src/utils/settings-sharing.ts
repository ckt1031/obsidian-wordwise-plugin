import { Notice } from 'obsidian';

import type WordWisePlugin from '@/main';
import type { PluginSettings } from '@/types';

export interface UriParams {
	data: string;
}

export default class SettingsExportImport {
	private plugin: WordWisePlugin;

	constructor(plugin: WordWisePlugin) {
		this.plugin = plugin;
	}

	private b64_to_utf8(str: string): string {
		return decodeURIComponent(atob(str));
	}

	private utf8_to_b64(str: string | number | boolean): string {
		return btoa(encodeURIComponent(str));
	}

	private getVaultName(): string {
		return this.plugin.app.vault.getName();
	}

	public generateSettingsStrings() {
		const vault = encodeURIComponent(this.getVaultName());
		const data = encodeURIComponent(
			this.utf8_to_b64(JSON.stringify(this.plugin.settings)),
		);

		const protocolURL = `obsidian://${this.plugin.manifest.id}?func=import&version=${this.plugin.manifest.version}&vault=${vault}&data=${data}`;

		return {
			protocolURL,
			encodedDataString: data,
		};
	}

	public importEncodedData(encoded_string_json: string) {
		let settings = {} as PluginSettings;

		try {
			settings = JSON.parse(
				this.b64_to_utf8(decodeURIComponent(encoded_string_json)),
			);
		} catch (e) {
			console.error(
				'Error while parsing settings from encoded string',
				encoded_string_json,
				e,
			);
			new Notice('Failed to parse input settings. Please check the format.');
			return;
		}

		new Notice(
			'Settings imported successfully, you might need to reload the plugin to apply them.',
		);

		this.plugin.settings = settings;
		this.plugin.saveSettings();
	}
}
