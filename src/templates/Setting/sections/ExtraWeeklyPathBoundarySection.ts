import type { SettingDefinitionItem } from "obsidian";
import { t } from "src/languages";

export function getExtraWeeklyPathBoundarySettings(): SettingDefinitionItem[] {
	return [
		{
			name: t("setting.paths.weekly.monthBoundary.name"),
			desc: t("setting.paths.weekly.monthBoundary.desc"),
			control: {
				type: "dropdown",
				key: "weeklyPathMonth",
				options: {
					start: t("setting.paths.weekly.monthBoundary.options.start"),
					end: t("setting.paths.weekly.monthBoundary.options.end"),
				},
			},
		},
	];
}
