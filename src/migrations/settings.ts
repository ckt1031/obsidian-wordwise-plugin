import type { PluginSettings } from '@/types';

type LegacyProviderSettings = PluginSettings['aiProviderConfig'][string] & {
	customModelId?: string;
};

export function migrateLegacySettings(settings: PluginSettings): boolean {
	let changed = false;

	for (const providerSettings of Object.values(
		settings.aiProviderConfig,
	) as LegacyProviderSettings[]) {
		const customModelId = providerSettings.customModelId?.trim();

		// 1.3.x stored advanced manual model overrides in customModelId.
		// 1.4.0+ uses the normal model field with manualModelInput enabled.
		if (customModelId) {
			if (providerSettings.model !== customModelId) {
				providerSettings.model = customModelId;
			}
			providerSettings.manualModelInput = true;
			changed = true;
		}

		// Drop the retired field after preserving the user's override.
		if ('customModelId' in providerSettings) {
			delete providerSettings.customModelId;
			changed = true;
		}
	}

	return changed;
}
