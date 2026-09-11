import type { SettingDefinitionItem } from "obsidian";
import { t } from "src/languages";

export function getHolidaySettings(): SettingDefinitionItem[] {
	return [
		{
			type: "group",
			heading: t("setting.sections.holidays"),
			items: [
				{
					name: t("setting.holidays.showOfficial.name"),
					desc: t("setting.holidays.showOfficial.desc"),
					control: { type: "toggle", key: "showHolidays" },
				},
				{
					name: t("setting.holidays.weekendDays.name"),
					desc: t("setting.holidays.weekendDays.desc"),
					control: {
						type: "dropdown",
						key: "weekendDays",
						options: {
							friday: t("setting.holidays.weekendDays.options.friday"),
							"thursday-friday": t("setting.holidays.weekendDays.options.thursdayFriday"),
							"friday-saturday": t("setting.holidays.weekendDays.options.fridaySaturday"),
						},
					},
				},
			],
		},
	];
}
