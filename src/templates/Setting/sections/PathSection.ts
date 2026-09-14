import { Setting, type SettingDefinitionItem } from "obsidian";
import NotePathBuilder from "src/services/NotePathBuilder";
import type PersianCalendarPlugin from "src/main";
import { t } from "src/languages";
import { NOTE_TYPES } from "../noteTypes";

export function getPathSettings(plugin: PersianCalendarPlugin): SettingDefinitionItem[] {
	const weeklyAnchorSetting = {
		name: "",
		render: (setting: Setting) => {
			const updateVisibility = () => {
				const visible = new NotePathBuilder(plugin).weeklyPathNeedsAnchor();
				setting.settingEl.style.display = visible ? "flex" : "none";
			};

			updateVisibility();

			if (!setting.settingEl.previousElementSibling) return;
			const weeklySettingEl = setting.settingEl.previousElementSibling;
			const weeklyInput = weeklySettingEl.querySelector("input");
			if (!weeklyInput) return;

			weeklyInput.addEventListener("blur", updateVisibility);
			weeklyInput.addEventListener("change", updateVisibility);
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
