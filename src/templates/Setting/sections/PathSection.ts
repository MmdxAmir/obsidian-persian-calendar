import { Setting, type SettingDefinitionItem } from "obsidian";
import NotePathBuilder from "src/services/NotePathBuilder";
import type PersianCalendarPlugin from "src/main";
import { t } from "src/languages";
import { NOTE_TYPES } from "../noteTypes";

export function getPathSettings(plugin: PersianCalendarPlugin): SettingDefinitionItem[] {
	const weeklyAnchorSetting = {
		name: "",
		render: (setting: Setting) => {
			const fa = plugin.setting.language === "fa";
			setting.setName(fa ? "مبنای تاریخ مسیر هفته‌نوشت" : "Weekly path date anchor");
			setting.setDesc(
				fa
					? "برای مسیر هفته‌نوشت، تاریخ مسیر از ابتدای هفته یا انتهای هفته محاسبه می‌شود."
					: "For weekly paths, date values are resolved from the start or end of the week.",
			);

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

			const updateVisibility = (path?: string) => {
				const visible = new NotePathBuilder(plugin).weeklyPathNeedsAnchor(path);
				setting.settingEl.style.display = visible ? "flex" : "none";
			};

			updateVisibility();

			if (!setting.settingEl.previousElementSibling) return;
			const weeklySettingEl = setting.settingEl.previousElementSibling;
			const weeklyInput = weeklySettingEl.querySelector("input");
			if (!weeklyInput) return;

			const updateFromInput = () => updateVisibility(weeklyInput.value);
			weeklyInput.addEventListener("input", updateFromInput);
			weeklyInput.addEventListener("change", updateFromInput);
			weeklyInput.addEventListener("blur", updateFromInput);
		},
	};

	return [
		{
			type: "group",
			heading: t("setting.sections.paths"),
			items: NOTE_TYPES.flatMap((noteType) => {
				const pathSetting = {
					name: t(noteType.pathNameKey),
					desc: t(noteType.pathDescKey),
					control: {
						type: "folder" as const,
						key: noteType.pathKey,
						includeRoot: true,
					},
				};

				return noteType.id === "weekly"
					? [pathSetting, weeklyAnchorSetting]
					: [pathSetting];
			}),
		},
	];
}
