import WordWisePlugin from '@/main';
import { PluginSettings } from '@/types';
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

function utf8_to_b64(str: string | number | boolean) {
	return btoa(encodeURIComponent(str));
}

function b64_to_utf8(str: string) {
	return decodeURIComponent(atob(str));
}

export const exportQrCodeUri = async (
	plugin: WordWisePlugin,
	currentVaultName: string,
) => {
	const vault = encodeURIComponent(currentVaultName);
	const data = encodeURIComponent(utf8_to_b64(JSON.stringify(plugin.settings)));
	const rawUri = `obsidian://${plugin.manifest.id}?func=import&version=${plugin.manifest.version}&vault=${vault}&data=${data}`;
	const imgUri = await QRCode.toDataURL(rawUri).catch(() => '');
	return {
		rawUri,
		imgUri,
	};
};

export const importQrCodeUri = (
	inputParams: unknown,
	currentVaultName: string,
): ProcessQrCodeResultType => {
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
		settings = JSON.parse(b64_to_utf8(decodeURIComponent(params.data)));
	} catch (e) {
		return {
			status: 'error',
			message: `Errors while parsing settings: ${JSON.stringify(inputParams)}`,
		};
	}
	return {
		status: 'ok',
		message: 'OK',
		result: settings,
	};
};
