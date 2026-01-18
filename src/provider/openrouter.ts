import { createOpenRouter } from '@openrouter/ai-sdk-provider';

import { APIProvider, PROVIDER_DEFAULTS } from '@/config';
import type { ProviderTextAPIProps } from '@/types';
import { getAPIHost } from '@/utils/get-url-host';
import { BaseProvider } from './base';

export class OpenRouterProvider extends BaseProvider {
	protected createModel(
		modelId: string,
		providerSettings: ProviderTextAPIProps['providerSettings'],
		_provider: string,
	) {
		const { apiKey, baseUrl } = providerSettings;

		const host = getAPIHost(
			baseUrl,
			PROVIDER_DEFAULTS[APIProvider.OpenRouter].host,
		);

		const openrouter = createOpenRouter({
			apiKey,
			baseURL: `${host}/api/v1`,
			headers: {
				'HTTP-Referer': 'https://github.com/ckt1031/obsidian-wordwise-plugin',
				'X-Title': 'Obsidian Wordwise Plugin',
			},
		});

		return openrouter(modelId);
	}
}

export async function handleTextOpenRouter(props: ProviderTextAPIProps) {
	return new OpenRouterProvider().handleText(props);
}
