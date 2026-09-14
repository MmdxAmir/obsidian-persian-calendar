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
				name: "",
				render: (setting: Setting) => {
					const visible = new NotePathBuilder(plugin).weeklyPathNeedsAnchor();
					setting.settingEl.style.display = visible ? "flex" : "none";
					if (!visible) return;
					const fa = plugin.setting.language === "fa";
					setting.setName(fa ? "مبنای تاریخ مسیر هفته‌نوشت" : "Weekly path date anchor");
					setting.setDesc(fa ? "برای مسیر هفته‌نوشت، تاریخ مسیر از ابتدای هفته یا انتهای هفته محاسبه می‌شود." : "For weekly paths, date values are resolved from the start or end of the week.");
					setting.addDropdown((dropdown) => {
						dropdown.addOption("start", fa ? "ابتدای هفته" : "Start of week");
						dropdown.addOption("end", fa ? "انتهای هفته" : "End of week");
						dropdown.setValue(plugin.setting.weeklyPathAnchor ?? "start");
						dropdown.onChange(async (value) => {
							plugin.setting.weeklyPathAnchor = value as "start" | "end";
							await plugin.saveSetting();
							plugin.refreshViews();
						});
					});
				},
			},
		],
	}];
}
