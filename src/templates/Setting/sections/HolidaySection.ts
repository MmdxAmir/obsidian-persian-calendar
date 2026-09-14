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
					name: t("setting.holidays.weekendDays.saturday.name"),
					desc: t("setting.holidays.weekendDays.saturday.desc"),
					control: {
						type: "toggle",
						key: "weekendDays.saturday",
					},
				},
				{
					name: t("setting.holidays.weekendDays.sunday.name"),
					desc: t("setting.holidays.weekendDays.sunday.desc"),
					control: {
						type: "toggle",
						key: "weekendDays.sunday",
					},
				},
				{
					name: t("setting.holidays.weekendDays.monday.name"),
					desc: t("setting.holidays.weekendDays.monday.desc"),
					control: {
						type: "toggle",
						key: "weekendDays.monday",
					},
				},
				{
					name: t("setting.holidays.weekendDays.tuesday.name"),
					desc: t("setting.holidays.weekendDays.tuesday.desc"),
					control: {
						type: "toggle",
						key: "weekendDays.tuesday",
					},
				},
				{
					name: t("setting.holidays.weekendDays.wednesday.name"),
					desc: t("setting.holidays.weekendDays.wednesday.desc"),
					control: {
						type: "toggle",
						key: "weekendDays.wednesday",
					},
				},
				{
					name: t("setting.holidays.weekendDays.thursday.name"),
					desc: t("setting.holidays.weekendDays.thursday.desc"),
					control: {
						type: "toggle",
						key: "weekendDays.thursday",
					},
				},
				{
					name: t("setting.holidays.weekendDays.friday.name"),
					desc: t("setting.holidays.weekendDays.friday.desc"),
					control: {
						type: "toggle",
						key: "weekendDays.friday",
					},
				},
			],
		},
	];
}
