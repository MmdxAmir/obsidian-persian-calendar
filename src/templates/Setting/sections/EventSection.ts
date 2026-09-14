import type { SettingDefinitionItem } from "obsidian";
import { t } from "src/languages";

export function getEventSettings(): SettingDefinitionItem[] {
	return [
		{
			type: "group",
			heading: t("setting.sections.events"),
			items: [
				{
					name: t("setting.events.official.name"),
					control: { type: "toggle", key: "showIROfficialEvents" },
				},
				{
					name: t("setting.events.global.name"),
					control: { type: "toggle", key: "showGlobalEvents" },
				},
				{
					name: t("setting.events.historical.name"),
					control: { type: "toggle", key: "showIRHistoricalEvents" },
				},
				{
					name: t("setting.events.ancient.name"),
					control: { type: "toggle", key: "showIRAncientEvents" },
				},
				{
					name: t("setting.events.shia.name"),
					control: { type: "toggle", key: "showShiaEvents" },
				},
				{
					name: t("setting.events.sunni.name"),
					control: { type: "toggle", key: "showSunniEvents" },
				},
			],
		},
	];
}
