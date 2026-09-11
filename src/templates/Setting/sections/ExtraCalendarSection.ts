import type { SettingDefinitionItem } from "obsidian";
import { t } from "src/languages";

export function getExtraCalendarSettings(): SettingDefinitionItem[] {
	return [
		{
			type: "group",
			heading: t("setting.sections.extraCalendars"),
			items: [
				{
					name: t("setting.extraCalendars.showGregorian.name"),
					desc: t("setting.extraCalendars.showGregorian.desc"),
					control: { type: "toggle", key: "showGeorgianDates" },
				},
				{
					name: t("setting.extraCalendars.showHijri.name"),
					desc: t("setting.extraCalendars.showHijri.desc"),
					control: { type: "toggle", key: "showHijriDates" },
				},
				{
					name: t("setting.extraCalendars.hijriBase.name"),
					desc: t("setting.extraCalendars.hijriBase.desc"),
					control: {
						type: "dropdown",
						key: "hijriBase",
						options: {
							iran: t("setting.extraCalendars.hijriBase.options.iran"),
							umalqura: t("setting.extraCalendars.hijriBase.options.umalqura"),
						},
					},
				},
			],
		},
	];
}
