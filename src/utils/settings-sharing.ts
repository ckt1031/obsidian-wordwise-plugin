import { QR_CODE_ENCRYPT_KEY } from '@/config';
import { PluginSettings } from '@/types';
import CryptoJS from 'crypto-js';
import QRCode from 'qrcode';
import manifest from '../../manifest.json';

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

const encryptBrowser = (text: string, key: string) => {
	return CryptoJS.AES.encrypt(text, key).toString();
};

const decryptBrowser = (encrypted: string, key: string) => {
	const bytes = CryptoJS.AES.decrypt(encrypted, key);
	return bytes.toString(CryptoJS.enc.Utf8);
};

export const exportQrCodeUri = async (
	settings: PluginSettings,
	currentVaultName: string,
) => {
	const vault = encodeURIComponent(currentVaultName);
	const data = encodeURIComponent(
		encryptBrowser(JSON.stringify(settings), QR_CODE_ENCRYPT_KEY),
	);
	const rawUri = `obsidian://${manifest.id}?func=import&version=${manifest.version}&vault=${vault}&data=${data}`;
	const imgUri = await QRCode.toDataURL(rawUri);
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
		settings = JSON.parse(
			decryptBrowser(decodeURIComponent(params.data), QR_CODE_ENCRYPT_KEY),
		);
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
