import WordWisePlugin from '@/main';
import type { PluginSettings } from '@/types';
import QRCode from 'qrcode';

export interface ProcessQrCodeResultType {
	status: 'error' | 'ok';
	message: string;
	result?: PluginSettings;
}

export interface UriParams {
	func?: string;
	vault?: string;
	data?: string;
}

export default class SettingsExportImport {
	private plugin: WordWisePlugin;

	constructor(plugin: WordWisePlugin) {
		this.plugin = plugin;
	}

	private b64_to_utf8(str: string) {
		return decodeURIComponent(atob(str));
	}

	private utf8_to_b64(str: string | number | boolean) {
		return btoa(encodeURIComponent(str));
	}

	private getVaultName() {
		return this.plugin.app.vault.getName();
	}

	public async exportQrCodeUri() {
		const vault = encodeURIComponent(this.getVaultName());
		const data = encodeURIComponent(
			this.utf8_to_b64(JSON.stringify(this.plugin.settings)),
		);

		const rawUri = `obsidian://${this.plugin.manifest.id}?func=import&version=${this.plugin.manifest.version}&vault=${vault}&data=${data}`;
		const imgUri = await QRCode.toDataURL(rawUri).catch(() => null);

		return {
			rawUri,
			imgUri,
			encodedDataString: data,
		};
	}

	public async importQrCodeUri(inputParams: unknown) {
		const currentVaultName = this.getVaultName();
		const params = inputParams as UriParams;

		if (
			params.func === undefined ||
			params.func !== 'import' ||
			params.vault === undefined ||
			params.data === undefined
		) {
			return {
				status: 'error',
				message: `The uri is not for exporting/importing settings: ${JSON.stringify(
					inputParams,
				)}`,
			};
		}

		if (params.vault !== currentVaultName) {
			return {
				status: 'error',
				message: `The target vault is ${
					params.vault
				} but you are currently in ${currentVaultName}: ${JSON.stringify(
					inputParams,
				)}`,
			};
		}

		let settings = {} as PluginSettings;

		try {
			settings = JSON.parse(this.b64_to_utf8(decodeURIComponent(params.data)));
		} catch (e) {
			return {
				status: 'error',
				message: `Errors while parsing settings: ${JSON.stringify(
					inputParams,
				)}`,
			};
		}
		return {
			status: 'ok',
			message: 'OK',
			result: settings,
		};
	}
}
