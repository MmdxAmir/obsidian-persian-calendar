import { Setting, type SettingDefinitionItem } from "obsidian";
import NotePathBuilder from "src/services/NotePathBuilder";
import type PersianCalendarPlugin from "src/main";
import { t } from "src/languages";
import { NOTE_TYPES } from "../noteTypes";

export function getPathSettings(plugin: PersianCalendarPlugin): SettingDefinitionItem[] {
	return [{
		type: "group",
		heading: t("setting.sections.paths"),
		items: [
			...NOTE_TYPES.map((noteType) => ({
				name: t(noteType.pathNameKey),
				desc: t(noteType.pathDescKey),
				control: { type: "folder" as const, key: noteType.pathKey, includeRoot: true },
			})),
			{
				name: plugin.setting.language === "fa" ? "مبنای تاریخ مسیر هفته‌نوشت" : "Weekly path date anchor",
				desc: plugin.setting.language === "fa"
					? "برای مسیر هفته‌نوشت، تاریخ مسیر از ابتدای هفته یا انتهای هفته محاسبه می‌شود."
					: "For weekly paths, date values are resolved from the start or end of the week.",
				control: {
					type: "dropdown" as const,
					key: "weeklyPathAnchor",
					options: {
						start: plugin.setting.language === "fa" ? "ابتدای هفته" : "Start of week",
						end: plugin.setting.language === "fa" ? "انتهای هفته" : "End of week",
					},
				},
			},
		],
	}];
}
